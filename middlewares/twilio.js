
const accountSid = 'AC02493af62c7cc91c254269eaf53155e1'
const authToken = '4f16585ddbe260d5203785f4a673e48f'
const serviceSid = 'VAeb866e7dd90bfd02f9fe54fce7ffecb2'

import Twilio from "twilio"
const client = new Twilio(accountSid, authToken)
// api for sending otp to the user mobile number....
export const generateOpt = (mobileNo) => {
  return new Promise((resolve, reject) => { // Add a "reject" parameter to the Promise callback
    client.verify
      .services(serviceSid)
      .verifications.create({
        to: `+91${mobileNo}`,
        channel: "sms",
      })
      .then((verifications) => {
        resolve(verifications.sid)
      })
      .catch((error) => { // Add a "catch" block to handle errors
        reject(error)
      })
  })  
}

// api for verifying the otp recived by the user
export const verifyOtp = (mobileNo, otp) => {
  return new Promise((resolve, reject) => { // Add a "reject" parameter to the Promise callback
    client.verify
      .services(serviceSid)
      .verificationChecks.create({
        to: `+91${mobileNo}`,
        code: otp,
      })
      .then((verifications) => {
        resolve(verifications)
      })
      .catch((error) => { // Add a "catch" block to handle errors
        reject(error)
      })
  })
}
