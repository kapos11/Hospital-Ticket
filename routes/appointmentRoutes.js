const express = require("express");
const router = express.Router();
const appointmentController = require("../controller/appointmentController");
const verifyJWT = require("../middleware/verifyJWT");
const generateBarcode = require("../middleware/generateBarcode");

router.use(verifyJWT);
router
  .route("/new")
  .post(generateBarcode, appointmentController.createAppointment);
router.route("/").get(appointmentController.getAllAppointment);
router.route("/:id").get(appointmentController.getPatientAppointments);
router.route("/:id").delete(appointmentController.cancelAppointments);

module.exports = router;
