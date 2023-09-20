const ENV_VARS = {
  // eslint-disable-next-line no-undef
  TWILIO_ACCOUNT_SID: process.env.TWILIO_ACCOUNT_SID,
 // eslint-disable-next-line no-undef
  TWILIO_AUTH_TOKEN: process.env.TWILIO_AUTH_TOKEN,
  TWILIO_SERVICE_SID: process.env.TWILIO_SERVICE_SID,

  CLOUD_NAME: process.env.CLOUD_NAME,
  API_KEY: process.env.API_KEY,
  API_SECRET: process.env.API_SECRET,

  RAZORPAY_KEY_ID: process.env.RAZORPAY_KEY_ID,
  RAZORPAY_KEY_SECRET: process.env.RAZORPAY_KEY_SECRET,

  PAYPAL_CLIENT_ID: process.env.PAYPAL_CLIENT_ID,
  PAYPAL_CLIENT_SECRET: process.env.PAYPAL_CLIENT_SECRET,

  GOOGLE_CLIENT_ID: process.env.GOOGLE_CLIENT_ID,
  GOOGLE_CLIENT_SECRET: process.env.GOOGLE_CLIENT_SECRET,
  GOOGLE_CALLBACK_URL: process.env.GOOGLE_CALLBACK_URL,

  DB_NAME: process.env.DB_NAME,
  DB_URL: process.env.DB_URL,
}
export default ENV_VARS
