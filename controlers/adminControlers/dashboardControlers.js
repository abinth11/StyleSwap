import { dashboardHelpers } from "../../helpers/adminHelpers/dashbaordHelpers.js"
import { graphHelpers } from "../../helpers/adminHelpers/graphHelper.js"
import generateReport from "../../middlewares/salesReport.js"
import fs from "fs"
export const dashboardControler = {
    adminDashboard: async (req, res) => {
        try {
          const [totalRevenue, totalOrders, totalProducts, monthlyEarnings] =
            await Promise.allSettled([
              dashboardHelpers.calculateTotalRevenue(),
              dashboardHelpers.calculateTotalOrders(),
              dashboardHelpers.calculateTotalNumberOfProducts(),
              dashboardHelpers.calculateMonthlyEarnings(),
            ]).then((results) =>
              results
                .filter((result) => result.status === "fulfilled")
                .map((result) => result.value)
            )
          res.render("admin/index", {
            totalRevenue,
            totalOrders,
            totalProducts,
            monthlyEarnings,
          })
        } catch (error) {
          res.render("error", { message: "Error fetching dashboard data" })
        }
      },
      makeReportGet: async (req, res) => {
        try {
          // Get the current date
          const currentDate = new Date()
          // Format the date as YYYY-MM-DD string
          const formattedCurrDay = currentDate.toISOString().slice(0, 10) // "YYYY-MM-DD"
          // Set the date to the first day of the month
          const firstDayOfMonth = new Date(
            currentDate.getFullYear(),
            currentDate.getMonth(),
            1
          )
          // Format the date as YYYY-MM-DD string
          const formattedFirstDay = firstDayOfMonth.toISOString().slice(0, 10) // "YYYY-MM-DD"
          const [
            totalProducts,
            totalRevenue,
            totalOrders,
            averageOrderValue,
            monthlyEarnings,
            mostSold,
            monthlySales
          ] = await Promise.allSettled([
            dashboardHelpers.calculateTotalNumberOfProductsByDate(
              formattedFirstDay,
              formattedCurrDay
            ),
            dashboardHelpers.calculateTotalRevenueByDate(
              formattedFirstDay,
              formattedCurrDay
            ),
            dashboardHelpers.calculateTotalOrdersByDate(
              formattedFirstDay,
              formattedCurrDay
            ),
            dashboardHelpers.calculateAverageOrderValue(
              formattedFirstDay,
              formattedCurrDay
            ),
            dashboardHelpers.calculateMonthlyEarnings(
              formattedFirstDay,
              formattedCurrDay
            ),
            graphHelpers.mostSellingProducts(formattedFirstDay,formattedCurrDay),
            graphHelpers.calculateMonthlySalesForGraph()
          ])
          const response = {
            totalRevenue,
            totalProducts,
            totalOrders,
            averageOrderValue,
            monthlyEarnings,
            mostSold,
            monthlySales:monthlySales.value
          }
          res.render("admin/create-report", { response })
        } catch (err) {
          res.status(500).send("Internal Server Error")
        }
      },
      filterReportData: async (req, res) => {
        try {
          //todo stopped here.. you dumb ...!
          const { from, to } = req.body
          const [
            totalRevenue,
            totalOrders,
            totalProducts,
            monthlyEarnings,
            averageOrderValue,
            mostSold
          ] =await Promise.allSettled([
            dashboardHelpers.calculateTotalRevenue(from, to),
            dashboardHelpers.calculateTotalOrders(from, to),
            dashboardHelpers.calculateTotalNumberOfProducts(from, to),
            dashboardHelpers.calculateMonthlyEarnings(),
            dashboardHelpers.calculateAverageOrderValue(),
            graphHelpers.mostSellingProducts(from,to)
          ]).then((results) =>
          results
            .filter((result) => result.status === "fulfilled")
            .map((result) => result.value)
        )
          const response = {
            totalRevenue,
            totalProducts,
            totalOrders,
            averageOrderValue,
            monthlyEarnings,
            mostSold,
            from,
            to,
          }
          res.json(response)
        } catch (error) {
          res.status(500).json({ Message: "Internal Server Error" })
        }
      },
      makeReport: async (req, res) => {
        const {
          format,
          totalRevenue,
          averageOrderValue,
          monthlyEarnings,
          totalOrders,
          numberOfProducts,
        } = req.body
        let {from, to} = req.body
        // Check if format field is present
        if (!format) {
          return res.status(400).send("Format field is required")
        } 
        if(from.trim().length == 0 ) {
          // Get the current date
          const currentDate = new Date()
          // Format the date as YYYY-MM-DD string
          const formattedCurrDay = currentDate.toISOString().slice(0, 10) // "YYYY-MM-DD"
          // Set the date to the first day of the month
          const firstDayOfMonth = new Date(
            currentDate.getFullYear(),
            currentDate.getMonth(),
            1
          )
          // Format the date as YYYY-MM-DD string
          const formattedFirstDay = firstDayOfMonth.toISOString().slice(0, 10) // "YYYY-MM-DD"
          from = formattedFirstDay
          to = formattedCurrDay
        }
        const mostSold = await graphHelpers.mostSellingProducts(from,to)
        const salesBasedOnMonth = await graphHelpers.calculateMonthlySalesForGraph()
        const salesData = {
          totalRevenue,
          averageOrderValue,
          monthlyEarnings,
          totalOrders,
          numberOfProducts,
          mostSold,
          salesBasedOnMonth
        }
        const date = {
          from,
          to,
        }
        
        try {
          // Convert the report into the selected file format and get the name of the generated file
          const reportFile = await generateReport(format, salesData, date).catch(
            (err) => {
              throw new Error(err)
            }
          )
          // Set content type and file extension based on format
          let contentType, fileExtension
          if (format === "pdf") {
            contentType = "application/pdf"
            fileExtension = "pdf"
          } else if (format === "excel") {
            contentType =
              "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet"
            fileExtension = "xlsx"
          } else {
            return res.status(400).send("Invalid format specified")
          }
          // Send the report back to the client and download it
          res.setHeader(
            "Content-Disposition",
            `attachment; filename=sales-report.${fileExtension}`
          )
          res.setHeader("Content-Type", contentType)
          const fileStream = fs.createReadStream(reportFile)
          fileStream.pipe(res)
          fileStream.on("end", () => {
            // Remove the file from the server
            fs.unlink(reportFile, (err) => {
              if (err) {
                throw new Error(err)
              }
            })
          })
        } catch (err) {
          return res.status(500).send("Error generating report")
        }
      },
      getChartData: async (req, res) => {
        try {
            const currentDate = new Date()
            const formattedCurrDay = currentDate.toISOString().slice(0, 10) // "YYYY-MM-DD"
            const firstDayOfMonth = new Date(
              currentDate.getFullYear(),
              currentDate.getMonth(),
              1
            )
            const formattedFirstDay = firstDayOfMonth.toISOString().slice(0, 10) // "YYYY-MM-DD"
            const chartData = await graphHelpers.mostSellingProducts(formattedFirstDay,formattedCurrDay)
        
          res.json({ chartData })
        } catch (error) {
          res.status(500).send("Internal Server Error")
        }
      },
      getData: async (req, res) => {
        try {
          const [sales, products, visitors, orderStat, paymentStat] =
            await Promise.allSettled([
                graphHelpers.calculateMonthlySalesForGraph(),
                graphHelpers.NumberOfProductsAddedInEveryMonth(),
                graphHelpers.findNumberOfMonthlyVisitors(),
                graphHelpers.orderStatitics(),
                graphHelpers.paymentStat(),
            ]).then((results) =>
              results
                .filter((result) => result.status === "fulfilled")
                .map((result) => result.value)
            )
          const response = {
            sales,
            products,
            visitors,
            orderStat,
            paymentStat,
          }
          res.json(response)
        } catch (error) {
          res.status(500).send("Internal Server Error")
        }
      },    
}