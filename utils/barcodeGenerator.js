const bwipjs = require("bwip-js");

//help to generate barcode
function generateBarcodeText() {
  const timestamp = Date.now().toString(36);
  const randomStr = Math.random().toString(36).substring(2, 6);
  return `HOSP-${timestamp}-${randomStr}`.toUpperCase();
}

async function generateBarcodeImage(barcodeText) {
  try {
    const png = await bwipjs.toBuffer({
      bcid: "code128",
      text: barcodeText,
      scale: 3,
      height: 10,
      includetext: true,
    });
    return `data:image/pmg;base64,${png.toString("base64")}`;
  } catch (err) {
    throw new Error("Failed to generate barecode image");
  }
}

module.exports = {
  generateBarcodeImage,
  generateBarcodeText,
};
