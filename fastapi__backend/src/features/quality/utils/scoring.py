from typing import Dict

# ===========================
# 评分配置 (Weights)
# ===========================
# 基础分
BASE_SCORE = 100.0

# 权重 (总和建议 1.0，但也可根据严苛程度调整)
WEIGHT_MISSING = 0.4    # 缺失值影响 40% 的扣分
WEIGHT_DUPLICATE = 0.3  # 重复值影响 30% 的扣分
WEIGHT_ANOMALY = 0.3    # 异常值影响 30% 的扣分

# 严苛系数 (系数越高，扣分越狠)
SEVERITY_MISSING = 50.0   # 如果缺失 10%，扣 0.1 * 50 * 0.4 = 2分? 
# 调整算法：直接按比例扣分
# Score = 100 - (MissingRate * 40 + DuplicateRate * 30 + AnomalyRate * 30) * 惩罚因子

def calculate_quality_score(
    missing_rate: float, 
    duplicate_rate: float, 
    anomaly_rate: float
) -> float:
    """
    计算数据质量评分 (0 - 100)
    
    Args:
        missing_rate: 0.0 - 1.0
        duplicate_rate: 0.0 - 1.0
        anomaly_rate: 0.0 - 1.0 (异常值数量 / 总单元格数，或者是 总行数)
        
    Returns:
        float: 0到100的分数
    """
    
    # 简单的线性扣分模型
    # 假设：
    # 100% 缺失 -> 扣 40 分
    # 100% 重复 -> 扣 30 分
    # 100% 异常 -> 扣 30 分
    
    penalty_missing = missing_rate * 40
    penalty_duplicate = duplicate_rate * 30
    
    # 异常值率通常很低，所以给它加一个放大系数，否则 1% 的异常才扣 0.3 分，太少了
    # 我们设定：如果超过 5% 的数据是异常的，就应该扣很多分
    penalty_anomaly = min(30, anomaly_rate * 10 * 30) 
    
    deduction = penalty_missing + penalty_duplicate + penalty_anomaly
    
    final_score = BASE_SCORE - deduction
    
    return float(max(0.0, round(final_score, 1)))