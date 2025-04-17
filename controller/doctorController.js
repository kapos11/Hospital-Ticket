const User = require("../models/User");
const Doctor = require("../models/Doctor");
const path = require("path");
const {
  cloudinaryUploadImg,
  cloudinaryDeleteImg,
} = require("../utils/cloudinary");
const fs = require("fs");
const httpStatusText = require("../utils/httpStatusText");
const AllowedSpecialties = require("../utils/specialties");

/**
 *
 * @desc Create New Doctor
 * @rout /doctor/new
 * @method POST
 * @access private (only admin)
 */
const createDoctor = async (req, res) => {
  const { fullName, specialty, email, phone, bio } = req.body;
  if (!fullName || !email || !phone || !specialty) {
    return res.status(400).json({
      status: httpStatusText.FAIL,
      data: {
        title: "All fields are required",
      },
    });
  }
  if (!AllowedSpecialties.includes(specialty)) {
    return res.status(400).json({
      status: httpStatusText.FAIL,
      data: {
        title: "Specialization is not allowed",
      },
    });
  }
  //Only admin
  const creator = await User.findById(req.userId);
  if (creator.isAdmin == false) {
    return res.status(400).json({
      status: httpStatusText.FAIL,
      data: {
        title: "Only admin can create Doctor",
      },
    });
  }
  const doctor = await Doctor.create({
    fullName,
    email,
    phone,
    bio,
    specialty,
  });
  res.status(201).json({
    status: httpStatusText.SUCCESS,
    data: {
      doctor,
    },
  });
};

/**
 *
 * @desc Get All Doctor
 * @rout /doctor/doctors
 * @method GET
 * @access private (Only admin)
 */

const getAllDoctor = async (req, res) => {
  const doctors = await Doctor.find();
  if (!doctors.length) {
    return res.status(404).json({
      status: httpStatusText.FAIL,
      data: {
        title: "doctor not found",
      },
    });
  }
  res.status(200).json({
    status: httpStatusText.SUCCESS,
    data: {
      doctors,
    },
  });
};

/**
 *
 * @desc Get Doctor By Id
 * @rout /doctor/doctors/:id
 * @method Get
 * @access private (only admin)
 */

const getDoctorById = async (req, res) => {
  const doctor = await Doctor.findById(req.params.id);
  if (!doctor) {
    return res.status(404).json({
      status: httpStatusText.FAIL,
      data: {
        title: "doctor not found",
      },
    });
  }
  res.status(200).json({
    status: httpStatusText.SUCCESS,
    data: {
      doctor,
    },
  });
};

/**
 *
 * @desc Get Doctor patients
 * @rout /doctor/doctors/:id/patients
 * @method Get
 * @access private (only admin)
 */

const getDoctorPatients = async (req, res) => {
  const doctor = await Doctor.findById(req.params.id).populate({
    path: "patients",
    select: "fullName email phone",
  });
  if (!doctor) {
    return res.status(404).json({
      status: httpStatusText.FAIL,
      data: {
        title: "doctor not found",
      },
    });
  }
  res.status(200).json({
    status: httpStatusText.SUCCESS,
    data: {
      doctorPatients: doctor.patients,
    },
  });
};

/**
 *
 * @desc Get Doctors specialties
 * @rout /doctor/doctors/specialty/:specialty
 * @method Get
 * @access public
 */

const getDoctorsBySpecialty = async (req, res) => {
  try {
    const { specialty } = req.params;
    const doctors = await Doctor.find({ specialty });
    if (!doctors.length) {
      return res.status(404).json({
        status: httpStatusText.FAIL,
        data: {
          title: "No specialty hashas been added yet",
        },
      });
    }
    res.status(200).json({
      status: httpStatusText.SUCCESS,
      data: {
        doctors,
      },
    });
  } catch (err) {
    res.status(200).json({
      status: httpStatusText.SUCCESS,
      data: {
        massage: err.message,
      },
    });
  }
};
/**
 *
 * @desc Get Doctors By Specialty
 * @rout /doctor/doctors?specialty="specialty-Name"
 * @method Get
 * @access public
 */

const getSpecialties = async (req, res) => {
  const specialties = await Doctor.distinct("specialty");
  if (!specialties) {
    return res.status(404).json({
      status: httpStatusText.FAIL,
      data: {
        doctor: "Add specialty first",
      },
    });
  }

  res.status(200).json({
    status: httpStatusText.SUCCESS,
    data: {
      specialties,
    },
  });
};

/**
 *
 * @desc Update Doctor
 * @rout /doctor/doctors/:id
 * @method PUT
 * @access private (only Admin)
 */

const updateDoctor = async (req, res) => {
  try {
    const doctorId = req.params.id;
    const userId = req.userId;
    const doctor = await Doctor.findById(doctorId);
    if (!doctor) {
      return res.status(404).json({
        status: httpStatusText.FAIL,
        data: {
          doctor: "doctor not found",
        },
      });
    }
    if (!userId.isAdmin) {
      return res.status(404).json({
        status: httpStatusText.FAIL,
        data: {
          title: "you are not authorized",
        },
      });
    }
    const updatedDoctor = await Doctor.findByIdAndUpdate(
      doctorId,
      {
        $set: {
          fullName: req.body.fullName,
          specialty: req.body.specialty,
          email: req.body.email,
          phone: req.body.phone,
          bio: req.body.bio,
        },
      },
      { new: true }
    );

    res.status(200).json({
      status: httpStatusText.SUCCESS,
      data: {
        doctor: updatedDoctor,
      },
    });
  } catch (error) {
    res.status(500).json({
      status: httpStatusText.ERROR,
      message: error.message,
    });
  }
};

/**
 *
 * @desc Delete Doctor
 * @rout /doctor/doctors/:id
 * @method DELETE
 * @access private (only Admin)
 */
const deleteDoctor = async (req, res) => {
  try {
    const doctorId = req.params.id;
    const userId = req.userId;
    const doctor = await Doctor.findById(doctorId);
    if (!doctor) {
      return res.status(404).json({
        status: httpStatusText.FAIL,
        data: {
          doctor: "doctor not found",
        },
      });
    }
    if (userId.isAdmin == false) {
      return res.status(404).json({
        status: httpStatusText.FAIL,
        data: {
          title: "you are not authorized",
        },
      });
    }
    await Doctor.findByIdAndDelete(doctorId);

    res.status(200).json({
      status: httpStatusText.SUCCESS,
      data: {
        doctor: null,
      },
    });
  } catch (error) {
    res.status(500).json({
      status: httpStatusText.ERROR,
      message: error.message,
    });
  }
};

/**
 *
 * @desc Upload Doctor image
 * @rout /doctor//upload-doctor-image
 * @method POST
 * @access private (only admin)
 */

const profilePhotoUpload = async (req, res) => {
  //GET doctor from db
  const doctor = await Doctor.findById(req.params.id);
  if (!req.file) {
    return res.status(400).json({
      status: httpStatusText.FAIL,
      data: {
        title: "Send a photo",
      },
    });
  }
  //GET img path
  const imagepath = path.join(__dirname, `../images/${req.file.filename}`);

  //upload img to cloudinary
  const uploadToCloudinary = await cloudinaryUploadImg(imagepath);

  //DELETE Old Photo
  if (doctor.profilePhoto.publicId !== null) {
    await cloudinaryDeleteImg(doctor.profilePhoto.publicId);
  }

  //Change the profile Photo in DB
  doctor.profilePhoto = {
    url: uploadToCloudinary.secure_url,
    publicId: uploadToCloudinary.public_id,
  };
  await doctor.save();

  //Send RES

  res.status(200).json({
    status: httpStatusText.FAIL,
    data: {
      profilePhoto: {
        url: uploadToCloudinary.secure_url,
        publicId: uploadToCloudinary.public_id,
      },
    },
  });

  //DELETE img from the server
  fs.unlinkSync(imagepath);
};

module.exports = {
  createDoctor,
  getAllDoctor,
  getDoctorById,
  getDoctorPatients,
  getDoctorsBySpecialty,
  getSpecialties,
  updateDoctor,
  deleteDoctor,
  profilePhotoUpload,
};
