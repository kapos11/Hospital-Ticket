const User = require("../models/User");
const bcrypt = require("bcrypt");
const path = require("path");
const {
  cloudinaryUploadImg,
  cloudinaryDeleteImg,
} = require("../utils/cloudinary");
const fs = require("fs");
const httpStatusText = require("../utils/httpStatusText");

/**
 *
 * @desc Get All User
 * @rout /users/
 * @method GET
 * @access private (only admin)
 */
const getAllUsers = async (req, res) => {
  const user = await User.find();
  if (!user.length) {
    res.status(400).json({
      status: httpStatusText.FAIL,
      data: {
        title: "Not user found",
      },
    });
  }
  res.status(200).json({
    status: httpStatusText.SUCCESS,
    data: {
      user,
    },
  });
};

/**
 *
 * @desc Get User By Id
 * @rout /users/:id
 * @method GET
 * @access private (only admin)
 */
const getUser = async (req, res) => {
  const user = await User.findById(req.params.id);
  if (!user) {
    res.status(404).json({
      status: httpStatusText.FAIL,
      data: {
        title: "Not user found",
      },
    });
  }
  res.status(200).json({
    status: httpStatusText.SUCCESS,
    data: {
      user,
    },
  });
};

/**
 *
 * @desc Update User
 * @rout /users/:id
 * @method Put
 * @access private (only owner)
 */
const updateUser = async (req, res) => {
  const user = await User.findById(req.params.id);
  const userId = req.userId;
  const { email } = req.body;
  if (!user) {
    return res.status(404).json({
      status: httpStatusText.FAIL,
      data: {
        title: "The post not found",
      },
    });
  }
  if (user._id.toString() !== userId) {
    return res.status(404).json({
      status: httpStatusText.FAIL,
      data: {
        title: "Cant access this post",
      },
    });
  }
  const checkEmail = await User.findOne({ email }).exec();
  if (checkEmail) {
    res.status(401).json({
      status: httpStatusText.FAIL,
      data: {
        title: "User already exists",
      },
    });
  }

  const hashedPassword = await bcrypt.hash(req.body.password, 10);
  const updatedUser = await User.findByIdAndUpdate(
    req.params.id,
    {
      $set: {
        name: req.body.name,
        email: req.body.email,
        password: hashedPassword,
        phone: req.body.phone,
      },
    },
    { new: true }
  )
    .select("-password")
    .lean();
  res.status(200).json({
    status: httpStatusText.SUCCESS,
    data: {
      updatedUser,
    },
  });
};

/**
 *
 * @desc Delete User
 * @rout /users/:id
 * @method Delete
 * @access private (only adsmin)
 */
const deleteUser = async (req, res) => {
  const user = await User.findById(req.params.id);
  if (!user) {
    return res.status(400).json({
      status: httpStatusText.FAIL,
      data: {
        title: "Not user found",
      },
    });
  }
  await User.findByIdAndDelete(user);
  res.status(200).json({
    status: httpStatusText.SUCCESS,
    data: {
      user: null,
    },
  });
};

/**
 *
 * @desc Upload User image
 * @rout /users//upload-user-image
 * @method POST
 * @access private (owner of Acount)
 */

const profilePhotoUpload = async (req, res) => {
  if (!req.file) {
    return res.status(400).json({
      status: httpStatusText.FAIL,
      data: {
        title: "Send the Photo",
      },
    });
  }
  //GET img path
  const imagepath = path.join(__dirname, `../images/${req.file.filename}`);

  //upload img to cloudinary
  const uploadToCloudinary = await cloudinaryUploadImg(imagepath);

  //GET user from db
  const user = await User.findById(req.userId);

  //DELETE Old Photo
  if (user.profilePhoto.publicId !== null) {
    await cloudinaryDeleteImg(user.profilePhoto.publicId);
  }

  //Change the profile Photo in DB
  user.profilePhoto = {
    url: uploadToCloudinary.secure_url,
    publicId: uploadToCloudinary.public_id,
  };
  await user.save();

  //Send RES
  res.status(200).json({
    status: httpStatusText.SUCCESS,
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
  getAllUsers,
  getUser,
  updateUser,
  deleteUser,
  profilePhotoUpload,
};
