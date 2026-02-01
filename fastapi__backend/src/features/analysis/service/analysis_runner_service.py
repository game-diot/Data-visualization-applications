from __future__ import annotations

import time
from typing import Any, Dict, List, Optional, Tuple
import traceback

from ..schema.analysis_request_schema import AnalysisRunRequest
from ..schema.analysis_response_schema import (
    AnalysisRunResponse,
    AnalysisError,
    AnalysisChart,
)
from ..utils.analysis_exception_util import AnalysisException
from ..constant.stage_constant import (
    STAGE_RECEIVED,
    STAGE_LOAD,
    STAGE_VALIDATE,
    STAGE_PROCESS,
    STAGE_DONE,
    STAGE_UNKNOWN,
)
from src.shared.utils.logger import logger

from .loader_service import load_dataframe
from .selector_service import apply_selection
from .validator_service import validate_request
from .analysis_methods_service import run_analysis_method

from .exporter_service import export_analysis_result_json
from ..constant.stage_constant import STAGE_EXPORT


def run_analysis(req: AnalysisRunRequest) -> AnalysisRunResponse:
    """
    Pipeline: Load -> Select -> Validate -> Process -> Response
    - artifacts: MVP default []
    - log[0] always Meta duration
    """


    start_ts = time.time()
    file_id = req.file_id

    logs: List[str] = []
    warnings: List[str] = []

    # stage tracking (fact source)
    stage = STAGE_RECEIVED
    logger.info(f"Runner[{file_id}]: Pipeline started.")

    try:
        # --- Load ---
        stage = STAGE_LOAD
        df0, load_profile, load_logs = load_dataframe(req.data_ref)
        logs.extend(load_logs)

        # --- Select (may raise validate-stage errors by design) ---
        # selector handles:
        # - rows out of range -> validate
        # - columns missing -> validate
        # - rows=0 -> validate
        df1, selection_profile, select_logs = apply_selection(df0, req.data_selection)
        logs.extend(select_logs)

        # --- Validate ---
        stage = STAGE_VALIDATE
        validated, validate_logs = validate_request(df1, req)
        logs.extend(validate_logs)

        # --- Process ---
        stage = STAGE_PROCESS
        try:
            key_metrics, charts_raw, method_warnings, method_logs = run_analysis_method(df1, validated)
        except AnalysisException:
            raise  # 直接透传（如果方法内部已经抛 AnalysisException）
        except Exception as e:
            # ✅ 统一归因 process
            raise AnalysisException(
                stage=STAGE_PROCESS,
                message="Process failed",
                details={"error": str(e)},
            )

        warnings.extend(method_warnings)
        logs.extend(method_logs)

        # Ensure at least 1 chart? (NOT enforced, you did not adopt 3.1)
        # But we still guarantee charts is an array (possibly empty)

        # --- Assemble summary (统一结构) ---
        input_shape = {"rows": int(load_profile["rows"]), "cols": int(load_profile["cols"])}
        selected_shape = {"rows": int(selection_profile["rows_after"]), "cols": int(selection_profile["cols_after"])}
        selected_columns = selection_profile["selected_columns"]

        summary: Dict[str, Any] = {
            "analysis_type": validated["analysis_type"],
            "input_shape": input_shape,
            "selected_shape": selected_shape,
            "selected_columns": selected_columns,
            "key_metrics": key_metrics,
        }

        # Convert raw charts dict to Pydantic model list
        charts: List[AnalysisChart] = [AnalysisChart(**c) for c in charts_raw]

        # --- Export (optional) ---
        artifacts = []
        export_enabled = bool(req.analysis_config.options.get("export", False))

        if export_enabled:
            # 进入 export stage（仅内部过程，最终 success stage 仍返回 done）
            stage = STAGE_EXPORT

            export_payload = {
                "summary": summary,
                "charts": [c.dict() for c in charts],  # Pydantic Chart -> dict
                "model_result": None,
                "meta": req.meta.dict(),
            }

            artifact, export_logs = export_analysis_result_json(
                file_id=req.file_id,
                analysis_version=req.meta.analysis_version,
                payload=export_payload,
            )
            artifacts = [artifact]
            logs.extend(export_logs)
        else:
            logs.append("Export: skipped (MVP)")

        elapsed_ms = int((time.time() - start_ts) * 1000)
        logs.insert(0, f"Meta: Pipeline finished in {elapsed_ms}ms")

        logger.info(f"Runner[{file_id}]: Pipeline success. Duration: {elapsed_ms}ms")

        return AnalysisRunResponse(
            status="success",
            stage=STAGE_DONE,
            summary=summary,
            charts=charts,
            model_result=None,   # MVP: no model_result
            artifacts=[],        # MVP: no export
            warnings=warnings,
            log=logs,
            error=None,
        )

    except AnalysisException as ae:
        # stage determined by exception.stage
        elapsed_ms = int((time.time() - start_ts) * 1000)
        logs.append(f"Error: [{ae.stage}] {ae.message}")
        logs.insert(0, f"Meta: Pipeline finished in {elapsed_ms}ms")

        logger.warning(f"Runner[{file_id}]: Failed at {ae.stage} - {ae.message}")

        return AnalysisRunResponse(
            status="failed",
            stage=ae.stage,
            summary=None,
            charts=[],
            model_result=None,
            artifacts=[],
            warnings=warnings,
            log=logs,
            error=AnalysisError(
                stage=ae.stage,
                message=ae.message,
                detail=_dev_detail(ae.details),
            ),
        )

    except Exception as e:
        elapsed_ms = int((time.time() - start_ts) * 1000)
        logs.append(f"Error: [{STAGE_UNKNOWN}] Unexpected system error: {str(e)}")
        logs.insert(0, f"Meta: Pipeline finished in {elapsed_ms}ms")

        logger.error(f"Runner[{file_id}]: Critical system error", exc_info=True)

        return AnalysisRunResponse(
            status="failed",
            stage=STAGE_UNKNOWN,
            summary=None,
            charts=[],
            model_result=None,
            artifacts=[],
            warnings=warnings,
            log=logs,
            error=AnalysisError(
                stage=STAGE_UNKNOWN,
                message="An unexpected system error occurred during analysis.",
                detail=_dev_detail(traceback.format_exc()),
            ),
        )


def _dev_detail(detail: Any) -> Any:
    """
    dev/prod detail 策略留口子：
    - 目前直接返回 detail（dev）
    - 你后续可根据环境变量裁剪 prod 的 detail
    """
    return detail
