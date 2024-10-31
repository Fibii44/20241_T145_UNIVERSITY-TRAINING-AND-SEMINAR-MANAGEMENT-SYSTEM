const axios = require('axios');

const RECAPTCHA_SECRET_KEY = process.env.RECAPTCHA_SECRET_KEY; // Replace with your reCAPTCHA secret key

const verifyRecaptcha = async (token) => {
    try {
        const response = await axios.post(`https://www.google.com/recaptcha/api/siteverify`, null, {
            params: {
                secret: RECAPTCHA_SECRET_KEY,
                response: token,
            },
        });

        console.log("reCAPTCHA Response:", response.data); // Log full response
        

        return response.data; // This will contain the verification result
    } catch (error) {
        throw new Error('Error verifying reCAPTCHA');
    }
};

module.exports = { verifyRecaptcha };
