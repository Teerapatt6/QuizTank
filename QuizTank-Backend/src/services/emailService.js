const sendOTP = async (toEmail, otpCode, type) => {
    /* For local testing without valid email credentials */
    console.log('---------------------------------------------------');
    console.log(`[DEV MODE] Sending OTP to ${toEmail}`);
    console.log(`[DEV MODE] OTP CODE: ${otpCode}`);
    console.log(`[DEV MODE] Type: ${type}`);
    console.log('---------------------------------------------------');


    return;
};

const sendContactEmail = async (fromName, fromEmail, subject, message) => {
    /* For local testing without valid email credentials
    console.log('---------------------------------------------------');
    console.log(`[DEV MODE] Sending Contact Email to Admin`);
    console.log(`[DEV MODE] From: ${fromName} <${fromEmail}>`);
    console.log(`[DEV MODE] Subject: ${subject}`);
    console.log(`[DEV MODE] Message: ${message}`);
    console.log('---------------------------------------------------');
    */

    return;
};

module.exports = { sendOTP, sendContactEmail };