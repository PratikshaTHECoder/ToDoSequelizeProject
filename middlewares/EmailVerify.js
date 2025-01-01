const nodemailer = require('nodemailer');
const Constant = require('../Constant');

const sendEmail = async (mailOptions) => {
  try {
    const transporter = nodemailer.createTransport({
      service: Constant.Messages.EMAIL_SERVICE, // Change this to your email service provider
      auth: {
        user: Constant.Messages.EMAIL_FROM, // Your email address
        pass: Constant.Messages.KEY, // Your email passwords
      },
    });

    const info = await transporter.sendMail(mailOptions);
  } catch (error) {
    throw error; // Throw the error to be handled by the calling function
  }
};

module.exports = { sendEmail };
