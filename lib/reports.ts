// lib/reports.ts
import { jsPDF } from 'jspdf'
import * as XLSX from 'xlsx'
import { format } from 'date-fns'

interface ReportOptions {
  includeProjectMetrics?: boolean
  includeTeamPerformance?: boolean
  includeFinancials?: boolean
  includeTimeline?: boolean
}

interface ReportData {
  dateRange: {
    from: Date
    to: Date
  }
  options: ReportOptions
  data: any // Your analytics data
}

export const ReportService = {
  async generatePDF(data: ReportData) {
    const doc = new jsPDF()
    let yPos = 20

    // Add header
    doc.setFontSize(20)
    doc.text('Analytics Report', 105, yPos, { align: 'center' })
    yPos += 10

    // Add date range
    doc.setFontSize(12)
    doc.text(
      `Date Range: ${format(data.dateRange.from, 'MMM d, yyyy')} - ${format(data.dateRange.to, 'MMM d, yyyy')}`,
      105,
      yPos,
      { align: 'center' }
    )
    yPos += 20

    if (data.options.includeProjectMetrics) {
      // Add project metrics
      doc.setFontSize(16)
      doc.text('Project Metrics', 20, yPos)
      yPos += 10
      
      doc.setFontSize(12)
      doc.text(`Total Projects: ${data.data.projectMetrics.total}`, 30, yPos)
      yPos += 10
      doc.text(`Completion Rate: ${data.data.projectMetrics.completionRate}%`, 30, yPos)
      yPos += 10
      doc.text(`Average Duration: ${data.data.projectMetrics.averageDuration} days`, 30, yPos)
      yPos += 20
    }

    // Add more sections based on options...

    return doc.save('analytics-report.pdf')
  },

  async generateExcel(data: ReportData) {
    const wb = XLSX.utils.book_new()
    
    if (data.options.includeProjectMetrics) {
      const metricsWS = XLSX.utils.json_to_sheet([
        {
          'Total Projects': data.data.projectMetrics.total,
          'Completion Rate': `${data.data.projectMetrics.completionRate}%`,
          'Average Duration': `${data.data.projectMetrics.averageDuration} days`
        }
      ])
      XLSX.utils.book_append_sheet(wb, metricsWS, 'Project Metrics')
    }

    if (data.options.includeTeamPerformance) {
      const teamWS = XLSX.utils.json_to_sheet(data.data.teamPerformance)
      XLSX.utils.book_append_sheet(wb, teamWS, 'Team Performance')
    }

    // Add more sheets based on options...

    XLSX.writeFile(wb, 'analytics-report.xlsx')
  },

  async generateCSV(data: ReportData) {
    let csvContent = '"Date Range",'
    csvContent += `"${format(data.dateRange.from, 'MMM d, yyyy')} - ${format(data.dateRange.to, 'MMM d, yyyy')}"\n\n`

    if (data.options.includeProjectMetrics) {
      csvContent += '"Project Metrics"\n'
      csvContent += '"Total Projects","Completion Rate","Average Duration"\n'
      csvContent += `${data.data.projectMetrics.total},`
      csvContent += `${data.data.projectMetrics.completionRate}%,`
      csvContent += `${data.data.projectMetrics.averageDuration} days\n\n`
    }

    // Add more sections based on options...

    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' })
    const link = document.createElement('a')
    link.href = URL.createObjectURL(blob)
    link.download = 'analytics-report.csv'
    link.click()
  }
}