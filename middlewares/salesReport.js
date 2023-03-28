import PDFDocument from "pdfkit"
import ExcelJS from "exceljs"
import fs from "fs"
async function generateReport(reportType, data, date) {
  console.log(reportType)
  console.log(data)
  try {
    if (reportType === "pdf") {
      const doc = new PDFDocument()
      const filename = "sales-report.pdf"
      const writeStream = fs.createWriteStream(filename)
      doc.pipe(writeStream)

      // Define the table headers
      const headers = [
        "Total Revenue",
        "Average Order Value",
        "Monthly Earnings",
        "Total Orders",
        "Products Added",
      ]

      // Define the table rows
      const rows = [
        [
          data.totalRevenue,
          data.averageOrderValue,
          data.monthlyEarnings,
          data.totalOrders,
          data.numberOfProducts,
        ],
      ]

      // Set the table cell padding
      const cellPadding = 10

      // Set the table cell width
      const cellWidth = 112

      // Set the table header style
      doc.font("Helvetica-Bold").fontSize(14)

      // Draw the main title
      doc.text("Sales Report", { align: "center" })

      // Set the table header style
      doc.font("Helvetica-Bold").fontSize(10)

      // Draw the table headers with border
      headers.forEach((header, index) => {
        doc.rect(cellPadding + index * cellWidth, 120, cellWidth, 20).stroke()
        doc.text(header, cellPadding + index * cellWidth + 5, 125)
      })

      // Set the table row style
      doc.font("Helvetica").fontSize(10)

      // Draw the table rows with border
      rows.forEach((row, rowIndex) => {
        row.forEach((cell, cellIndex) => {
          doc
            .rect(
              cellPadding + cellIndex * cellWidth,
              140 + rowIndex * 20,
              cellWidth,
              20
            )
            .stroke()
          doc.text(
            cell,
            cellPadding + cellIndex * cellWidth + 5,
            145 + rowIndex * 20
          )
        })
      })

      // Add footer
      const fromDate = date.from
      const toDate = date.to

      // Move down by 20 points
      doc.moveDown(20)

      // Add some more text to the PDF
      doc.text(``, doc.x - 30, doc.y)
      doc.moveDown(20)
      doc.fontSize(10).text(`Report Period:`, doc.x - 30, doc.y)
      doc.moveDown(2)
      doc.fontSize(10).text(`${fromDate} to ${toDate}`, doc.x - 30, doc.y)
      // Finalize the PDF document
      doc.end()
      await new Promise((resolve, reject) => {
        writeStream.on("finish", () => {
          console.log(`PDF report saved to ${filename}`)
          resolve(filename)
        })
        writeStream.on("error", (error) => {
          console.error(`Error saving PDF report: ${error}`)
          reject(error)
        })
      })
      return filename
    } else if (reportType === "excel") {
      const workbook = new ExcelJS.Workbook()
      const worksheet = workbook.addWorksheet("Sales Report")

      // Extract values from data object
      const values = Object.values(data)

      // Define custom column headers
      const headers = [
        { header: "Total Revenue", key: "totalRevenue", width: 20 },
        { header: "Avergae Order Value", key: "averageOrderValue", width: 20 },
        { header: "Monthly Earnings", key: "monthlyEarnings", width: 20 },
        { header: "Total Orders", key: "totalOrders", width: 20 },
        { header: "Products added", key: "numberOfProducts", width: 20 },
      ]

      // Set the columns on the worksheet using custom headers
      worksheet.columns = headers

      // Add row to worksheet with data from object values
      worksheet.addRow(values)

      const filename = "sales-report.xlsx"
      await workbook.xlsx.writeFile(filename)
      console.log(`Excel report saved to ${filename}`)
      return filename
    } else {
      throw new Error(`Invalid report type: ${reportType}`)
    }
  } catch (error) {
    console.error(`Error generating ${reportType} report: ${error}`)
    throw error
  }
}
export default generateReport
