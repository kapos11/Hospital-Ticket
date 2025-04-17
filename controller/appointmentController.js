const Appointment = require("../models/Appointment");
const Doctor = require("../models/Doctor");
const User = require("../models/User");
const sendEmail = require("../utils/sendEmail");
const httpStatusText = require("../utils/httpStatusText");

/**
 *
 * @desc Create New appointment
 * @rout /appointment/new
 * @method POST
 * @access private (only loggin user)
 */

const createAppointment = async (req, res) => {
  const { doctorId, appointmentDate } = req.body;
  const doctor = await Doctor.findById(doctorId);
  const patient = await User.findById(req.userId);
  if (!doctor) {
    return res.status(404).json({
      status: httpStatusText.FAIL,
      data: {
        title: "doctor not found ",
      },
    });
  }
  //if patient already have ticket
  const isInclude = doctor.patients.includes(req.userId);
  if (isInclude) {
    return res.status(400).json({
      status: httpStatusText.FAIL,
      data: {
        title: "Patient already have ticket",
      },
    });
  }
  if (appointmentDate > Date.now) {
    return res.status(400).json({
      status: httpStatusText.FAIL,
      data: {
        title: "Invalid time ",
      },
    });
  }
  if (doctor.patients.length >= 1) {
    return res.status(400).json({
      status: httpStatusText.FAIL,
      data: {
        title: "All tickets for today are booked",
      },
    });
  }

  //validate time
  const appointmenTime = new Date(appointmentDate);
  const hours = appointmenTime.getHours();
  const minutes = appointmenTime.getMinutes();
  if (!(hours >= 8 && hours < 16 && (minutes === 0 || minutes === 30))) {
    return res.status(400).json({
      status: httpStatusText.FAIL,
      data: {
        title:
          "Appointment are Only avaliable every half hours from 8am to 4pm ",
      },
    });
  }

  //Check no other appointment in that Time
  const existingAppointment = await Appointment.findOne({
    doctor: doctorId,
    appointmentDate: appointmenTime,
  });
  if (existingAppointment) {
    return res.status(400).json({
      status: httpStatusText.FAIL,
      data: {
        title: "Appointment is booked",
      },
    });
  }

  const newAppointment = await Appointment.create({
    barcode: req.barcodeData.barcodeText,
    barcodeImage: req.barcodeData.barecodeImage,
    doctor: doctorId,
    patient: req.userId,
    appointmentDate,
  });

  await sendEmail({
    to: patient.email,
    barcodeText: newAppointment.barcode,
    barcodeImage: newAppointment.barcodeImage,
    appointmentDate: newAppointment.appointmentDate,
  });

  //add patient to doctor
  doctor.patients.push(req.userId);
  await doctor.save();

  res.status(201).json({
    status: httpStatusText.SUCCESS,
    data: {
      appointmen: newAppointment,
    },
  });
};

/**
 *
 * @desc Get All appointment
 * @rout /appointment/
 * @method GET
 * @access private (Only admin)
 */

const getAllAppointment = async (req, res) => {
  const appointments = await Appointment.find()
    .populate("doctor", " name specialty")
    .select("appointmentDate barcode");
  if (!appointments.length) {
    return res.status(404).json({
      status: httpStatusText.FAIL,
      data: {
        title: "doctor not found ther are no appointment ",
      },
    });
  }
  res.status(200).json({
    status: httpStatusText.SUCCESS,
    data: {
      appointments,
    },
  });
};

/**
 *
 * @desc Get Patient appointment
 * @rout /appointment/:id
 * @method GET
 * @access private (Only admin)
 */

const getPatientAppointments = async (req, res) => {
  const { id } = req.params;
  const appointmens = await Appointment.find({ patient: id })
    .populate("doctor", " name specialty")
    .select("appointmentDate barcode");

  if (!appointmens.length) {
    return res.status(404).json({
      status: httpStatusText.FAIL,
      data: {
        title: "There are no appointment for this patien",
      },
    });
  }

  res.status(200).json({
    status: httpStatusText.SUCCESS,
    data: {
      appointmens,
    },
  });
};

/**
 *
 * @desc Cancel appointment
 * @rout /appointment/:id
 * @method DELETE
 * @access private (Only admin)
 */

const cancelAppointments = async (req, res) => {
  //get appointment
  const appointmenId = req.params.id;
  const appointmen = await Appointment.findById(appointmenId);
  //get patient
  const patientid = req.userId;
  const patient = await User.findById(patientid);
  if (!appointmen) {
    return res.status(404).json({
      status: httpStatusText.FAIL,
      data: {
        title: "there are no appointment",
      },
    });
  }

  if (patient.isAdmin === false && patientid == appointmen.patient) {
    return res.status(403).json({
      status: httpStatusText.FAIL,
      data: {
        title: "you cant cancel this appointment",
      },
    });
  }

  await Appointment.findByIdAndDelete(appointmenId);

  res.status(200).json({
    status: httpStatusText.SUCCESS,
    data: {
      appointmen: null,
    },
  });
};

module.exports = {
  createAppointment,
  getPatientAppointments,
  getAllAppointment,
  cancelAppointments,
};
