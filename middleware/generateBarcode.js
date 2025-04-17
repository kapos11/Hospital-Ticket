const {
  generateBarcodeImage,
  generateBarcodeText,
} = require("../utils/barcodeGenerator");
const Appointment = require("../models/Appointment");

module.exports = async function (req, res, next) {
  //text Barcode
  const barcodeText = generateBarcodeText();

  //image barcode
  const barecodeImage = await generateBarcodeImage(barcodeText);

  //add to req to use in controller
  req.barcodeData = {
    barcodeText,
    barecodeImage,
  };
  //console.log(req.barcodeData);

  next();
};
