const express = require("express");
const router = express.Router();
const doctorController = require("../controller/doctorController");
const verifyJWT = require("../middleware/verifyJWT");
const photoUpload = require("../middleware/photoUpload");

router.use(verifyJWT);
router.route("/new").post(doctorController.createDoctor);
router.route("/doctors").get(doctorController.getAllDoctor);
router.route("/doctors/:id").get(doctorController.getDoctorById);
router.route("/doctors/:id/patients").get(doctorController.getDoctorPatients);
router.route("/getSpecialties").get(doctorController.getSpecialties);
router
  .route("/specialty/:specialty")
  .get(doctorController.getDoctorsBySpecialty);
router.route("/doctors/:id/").put(doctorController.updateDoctor);
router.route("/doctors/:id/").delete(doctorController.deleteDoctor);
router
  .route("/upload-doctor-image/:id")
  .post(photoUpload.single("image"), doctorController.profilePhotoUpload);

module.exports = router;
