const sessionCheck = {
  isAdminExist: (req, res, next) => {
    try {
      req.session.admin ? next() : res.redirect('/admin')
    } catch (error) {
      console.log(error)
      res.send(500).json({ message: 'session error while login' })
    }
  },
  isUserExist: (req, res, next) => {
    try {
      req.session.user ? next() : res.redirect('/')
    } catch (error) {
      console.log(error)
      res.send(500).json({ message: 'session error while login' })
    }
  },
  isUserOrGuestExist: (req, res, next) => {
    try {
      if (req.session.user || req.session.guestUser) {
        next()
      } else {
        res.redirect('/')
      }
    } catch (error) {
      console.log(error)
      throw new Error('session handling error for user and guest')
    }
  }
}
export default sessionCheck
