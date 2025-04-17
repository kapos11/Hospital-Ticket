const mongoose = require("mongoose");
const User = require("./User");
const AllowedSpecialties = require("../utils/specialties");
const doctorSchema = new mongoose.Schema(
  {
    fullName: {
      type: String,
      require: true,
    },
    specialty: {
      type: String,
      enum: AllowedSpecialties,
      require: true,
    },
    email: {
      type: String,
      require: true,
    },
    phone: {
      type: String,
      require: true,
    },
    bio: String,
    profilePhoto: {
      type: Object,
      default: {
        url: "",
        publicId: null,
      },
    },
    patients: [
      {
        type: mongoose.Schema.Types.ObjectId,
        ref: "User",
      },
    ],
  },
  {
    timestamps: true,
    toJSON: { virtuals: true },
    toObject: { virtuals: true },
  }
);

module.exports = mongoose.model("Doctor", doctorSchema);
