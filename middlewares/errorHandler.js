class CustomError extends Error {
  constructor (status, message, code) {
    super(message)
    this.status = status
    this.code = code
    Error.captureStackTrace(this, this.constructor)
  }
}

export default CustomError
