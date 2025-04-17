const nodemailer = require("nodemailer");
const Appointment = require("../models/Appointment");

const sendEmail = async (options) => {
  //Create transporter (service that will send email)
  const transporter = nodemailer.createTransport({
    host: process.env.EMAIL_HOST,
    port: process.env.EMAIL_PORT,
    secure: true,
    auth: {
      user: process.env.EMAIL_USER,
      pass: process.env.EMAIL_PASSWORD,
    },
  });

  //Difine email option
  const emailOption = {
    from: "El-Mak Nimeer Hospital",
    to: options.to,
    subject: options.subject || "تذكره",
    html: `
    <div dir="rtl>
      <h2>تفاصيل حجز الموعد</h2>
      <p> رقم التذكره : <strong>${options.barcodeText}</strong></p>
      <p> تاريخ الموعد: <strong>${new Date(
        options.AppointmentDate
      ).toLocaleString("ar-EG")}</strong></p>
      <img src="${
        options.barcodeImage
      }" alt="barcodeImage "style="max=width : 300px;"/>
      <p>الرجاء الحضور عند الموعد</p>
      <div/>`,
    attachments: [
      {
        filename: "barcode.png",
        content: options.barcodeImage.split("base64")[1],
        encoding: "base64",
      },
    ],
  };

  //Send email
  await transporter.sendMail(emailOption);
};

module.exports = sendEmail;
