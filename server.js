// create server
require("dotenv").config();
const express = require("express");
const app = express();

//CRON
const cleanupAppointments = require("./config/cronJobs");

const cors = require("cors");
const corsOption = require("./config/corsOption");
const cookieParser = require("cookie-parser");
const path = require("path");

//connect DB
const mongoose = require("mongoose");
const connectDb = require("./config/dbconnect");
const PORT = process.env.PORT || 5000;

connectDb();

app.use(cors({ corsOption }));
app.use(cookieParser());
app.use(express.json());

//Routes
app.use("/auth", require("./routes/authRoutes"));
app.use("/users", require("./routes/userRoutes"));
app.use("/doctor", require("./routes/doctorRoutes"));
app.use("/appointment", require("./routes/appointmentRoutes"));

cleanupAppointments();

//if connect done
mongoose.connection.once("open", () => {
  console.log("connection to database is done");
  app.listen(PORT, () => {
    console.log(`server is running on port ${PORT}`);
  });
});

// if not
mongoose.connection.on("error", (err) => {
  console.log(err);
});
