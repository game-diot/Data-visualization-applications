import React from 'react'
import { Card, Statistic, Row, Col } from 'antd'
import type { QualityReportVM } from '@/entities/quality/types/quality.type'

interface Props {
  data: QualityReportVM
}

export const OverviewCards: React.FC<Props> = ({ data }) => {
  return (
    <Row gutter={[16, 16]}>
      <Col span={6}>
        <Card bordered={false} className="shadow-sm">
          <Statistic
            title="综合质量得分"
            value={data.qualityScore}
            suffix="/ 100"
            valueStyle={{
              color: data.qualityScore > 80 ? '#3f8600' : '#cf1322',
              fontWeight: 'bold',
            }}
          />
        </Card>
      </Col>
      <Col span={6}>
        <Card bordered={false} className="shadow-sm">
          {/* 直接使用 Mapper 洗好的字符串，防止大数字没有千分位 */}
          <Statistic title="总行数" value={data.rowCountFormatted} />
        </Card>
      </Col>
      <Col span={6}>
        <Card bordered={false} className="shadow-sm">
          <Statistic title="缺失率" value={data.missing.missingRateFormatted} />
        </Card>
      </Col>
      <Col span={6}>
        <Card bordered={false} className="shadow-sm">
          <Statistic title="重复率" value={data.duplicates.duplicateRateFormatted} />
        </Card>
      </Col>
    </Row>
  )
}
