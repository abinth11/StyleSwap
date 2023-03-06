module.exports = {
  isAdminExist: (req, res, next) => {
    if (req.session.admin) {
      next()
    } else {
      res.redirect('/admin')
    }
  },
  isUserExist: (req, res, next) => {
    if (req.session.user) {
      next()
    } else {
      res.redirect('/')
    }
  }
}
