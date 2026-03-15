import html2canvas from 'html2canvas'
import { jsPDF } from 'jspdf'

/**
 * 🚀 智能 PDF 导出工具
 * @param elementId 要导出的 DOM 元素 ID (比如我们的 Drawer 容器)
 * @param fileName 导出的文件名
 */
export const exportElementToPDF = async (elementId: string, fileName: string) => {
  const element = document.getElementById(elementId)
  if (!element) return

  try {
    // 1. 捕捉画面：将 DOM 转为 Canvas
    // scale: 2 提高清晰度，useCORS 处理 ECharts 跨域图片（如果有）
    const canvas = await html2canvas(element, {
      scale: 2,
      useCORS: true,
      logging: false,
      backgroundColor: '#ffffff',
    })

    const imgData = canvas.toDataURL('image/png')

    // 2. 页面布局：计算 A4 纸张比例
    const pdf = new jsPDF('p', 'mm', 'a4')
    const pdfWidth = pdf.internal.pageSize.getWidth()
    const pdfHeight = (canvas.height * pdfWidth) / canvas.width

    // 3. 分页处理逻辑
    let heightLeft = pdfHeight
    let position = 0
    const pageHeight = pdf.internal.pageSize.getHeight()

    // 第一页
    pdf.addImage(imgData, 'PNG', 0, position, pdfWidth, pdfHeight)
    heightLeft -= pageHeight

    // 如果内容超长，自动分页
    while (heightLeft >= 0) {
      position = heightLeft - pdfHeight
      pdf.addPage()
      pdf.addImage(imgData, 'PNG', 0, position, pdfWidth, pdfHeight)
      heightLeft -= pageHeight
    }

    // 4. 胜利发射！
    pdf.save(`${fileName}.pdf`)
  } catch (error) {
    console.error('PDF 导出失败:', error)
  }
}
