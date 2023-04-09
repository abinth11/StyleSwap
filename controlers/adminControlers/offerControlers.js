import { offerHelpers } from "../../helpers/adminHelpers/offerHelpers.js"
export const offerControlers ={
    addOffersGet: (req, res) => {
        res.render("admin/offer-category")
      },
      addOffersPost: (req, res) => {
        offerHelpers.addOffer(req.body).then((response) => {
          res.json(response)
        })
      },
      replaceOfers: (req) => {
        offerHelpers.replaceOfers(req.body)
      },
      addOffersProducts: (req, res) => {
        res.render("admin/offer-products", { prodInfo: req.query })
      },
      addOffersProductsPost: (req, res) => {
        offerHelpers.addOfferToProducts(req.body).then(() => {
          res.redirect(
            "/admin/dashboard/view-product-list/add-offers-for-products"
          )
        })
      },
      viewOffers: (req, res) => {
        res.render("admin/view-offers")
      },

}