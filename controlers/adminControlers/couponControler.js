import { couponHelpers } from "../../helpers/adminHelpers/couponHelper.js"
import { uploadSingle } from "../../config/cloudinary.js"
export const couponControler= {
    addCouponTemplate: (req, res) => {
        try {
          res.render("admin/add-coupon")
        } catch (error) {
          res.status(500).send("Internal Server Error")
        }
      },
      addCouponTemplatePost: (req, res) => {
        try {
          uploadSingle(req.file)
            .then(async (urls) => {
                couponHelpers.addCouponTemplate(req.body, urls).then(() => {
                res.redirect("/admin/dashboard/add-coupon")
              })
            })
            .catch((error) => {
              throw new Error(error)
            })
        } catch (error) {
            res.status(500).send("Internal Server Error")
        }
      },
      viewCoupons: async (req, res) => {
        try {
          const coupons = await couponHelpers.getAllCoupons()
          res.render("admin/view-coupon", { coupons })
        } catch (error) {
          res.status(500).send("Internal Server Error")
        }
      },
}