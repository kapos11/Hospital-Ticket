const mongoose = require("mongoose");
const User = require("./User");
const Doctor = require("./Doctor");

const appointmentSchema = new mongoose.Schema({
  barcode: {
    type: String,
    unique: true,
    index: true,
    require: true,
  },
  doctor: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "Doctor",
  },
  patient: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "User",
  },
  appointmentDate: {
    type: Date,
    require: true,
    validate: {
      validator: function (date) {
        const hours = date.getHours();
        const minutes = date.getMinutes();
        // from 8am To 4pm every 30min
        return hours >= 8 && hours < 16 && (minutes === 0 || minutes === 30);
      },
      message: "Appointment are Only avaliable every half hours from 8am",
    },
  },
  barcodeImage: {
    type: String,
  },
});

module.exports = mongoose.model("Appointment", appointmentSchema);
