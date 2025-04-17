const crypto = require("crypto");
const User = require("../models/User");
const bcrypt = require("bcrypt");
const jwt = require("jsonwebtoken");
const httpStatusText = require("../utils/httpStatusText");

/**
 *
 * @desc register
 * @rout /auth/register
 * @method POST
 * @access public
 */
const register = async (req, res) => {
  const { name, email, password, phone, isAdmin } = req.body;
  if (!name || !email || !phone || !password) {
    return res.status(400).json({
      status: httpStatusText.FAIL,
      data: {
        title: "All fieldes are required",
      },
    });
  }
  const foundUser = await User.findOne({ email }).exec();
  if (foundUser) {
    res.status(401).json({
      status: httpStatusText.FAIL,
      data: {
        title: "User already exists",
      },
    });
  }
  const hashedPassword = await bcrypt.hash(password, 10);
  const user = await User.create({
    name,
    email,
    phone,
    password: hashedPassword,
    isAdmin,
  });
  const accessToken = jwt.sign(
    {
      userInfo: {
        id: user._id,
        isAdmain: user.isAdmin,
      },
    },
    process.env.ACCESS_TOKEN_SECRET,
    { expiresIn: "15m" }
  );
  const refreshToken = jwt.sign(
    {
      userInfo: {
        id: user._id,
        isAdmain: user.isAdmin,
      },
    },
    process.env.RESRESH_TOKEN_SECRET,
    { expiresIn: "7d" }
  );
  res.cookie("jwt", refreshToken, {
    httpOnly: true,
    secure: true, // https
    sameSite: "none",
    maxAge: 7 * 24 * 60 * 60 * 1000,
  });
  res.json({
    status: httpStatusText.SUCCESS,
    data: {
      accessToken,
      email: user.email,
      first_name: user.first_name,
      last_name: user.last_name,
    },
  });
};

/**
 *
 * @desc login
 * @rout /auth/login
 * @method POST
 * @access private (register users)
 */
const login = async (req, res) => {
  const { email, password } = req.body;
  if (!email || !password) {
    return res.status(400).json({
      status: httpStatusText.FAIL,
      data: {
        title: "All fieldes are required",
      },
    });
  }
  const foundUser = await User.findOne({ email }).exec();
  if (!foundUser) {
    return res.status(401).json({
      status: httpStatusText.FAIL,
      data: {
        title: "User Not exists",
      },
    });
  }
  const match = await bcrypt.compare(password, foundUser.password);

  if (!match) {
    return res.status(401).json({
      status: httpStatusText.FAIL,
      data: {
        title: "Wrong password",
      },
    });
  }

  const accessToken = jwt.sign(
    {
      userInfo: {
        id: foundUser._id,
        isAdmin: foundUser.isAdmin,
      },
    },
    process.env.ACCESS_TOKEN_SECRET,
    { expiresIn: "15m" }
  );
  const refreshToken = jwt.sign(
    {
      userInfo: {
        id: foundUser._id,
        isAdmain: foundUser.isAdmin,
      },
    },
    process.env.RESRESH_TOKEN_SECRET,
    { expiresIn: "7d" }
  );
  res.cookie("jwt", refreshToken, {
    httpOnly: true,
    secure: true, // https
    sameSite: "none",
    maxAge: 7 * 24 * 60 * 60 * 1000,
  });
  res.json({
    status: httpStatusText.SUCCESS,
    data: {
      accessToken,
      id: foundUser.id,
      email: foundUser.email,
      first_name: foundUser.first_name,
    },
  });
};

/**
 *
 * @desc refresh Token
 * @rout /auth/refresh
 * @method GET
 * @access private (register users)
 */

const refresh = (req, res) => {
  const cookies = req.cookies;
  if (!cookies.jwt) {
    return res.status(401).json({
      status: httpStatusText.FAIL,
      data: {
        title: "Unauthorized",
      },
    });
  }
  const refreshToken = cookies.jwt;
  jwt.verify(
    refreshToken,
    process.env.RESRESH_TOKEN_SECRET,
    async (err, decoded) => {
      if (err) {
        return res.status(403).json({
          status: httpStatusText.FAIL,
          data: {
            title: "Forbidden",
          },
        });
      }

      const foundUser = await User.findById(decoded.userInfo.id).exec();
      if (!foundUser) {
        return res.status(401).json({
          status: httpStatusText.FAIL,
          data: {
            title: "Unauthorized",
          },
        });
      }
      const accessToken = jwt.sign(
        {
          userInfo: {
            id: foundUser._id,
            isAdmain: foundUser.isAdmin,
          },
        },
        process.env.ACCESS_TOKEN_SECRET,
        { expiresIn: "15m" }
      );
      res.json({
        status: httpStatusText.SUCCESS,
        data: {
          accessToken,
        },
      });
    }
  );
};

/**
 *
 * @desc logout
 * @rout /auth/logout
 * @method POST
 * @access private (login users)
 */

const logout = (req, res) => {
  const cookies = req.cookies;
  if (!cookies?.jwt) {
    return res.sendStatus(204); //not content
  }
  res.clearCookie("jwt", {
    httpOnly: true,
    sameSite: true,
    secure: true,
  });
  res.json({
    status: httpStatusText.FAIL,
    data: {
      title: "Logout success",
    },
  });
};

module.exports = {
  register,
  login,
  refresh,
  logout,
};
