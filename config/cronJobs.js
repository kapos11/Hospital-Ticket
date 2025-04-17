const cron = require("node-cron");
const Appointment = require("../models/Appointment");
const Doctor = require("../models/Doctor");

const cleanupAppointments = () => {
  cron.schedule("1 16 * * *", async () => {
    try {
      const endOfDay = new Date();
      endOfDay.setHours(16, 0, 0, 0); //4pm

      // search end appointment
      const expiredAppointment = await Appointment.find({
        appointmentDate: { $lte: endOfDay },
      });

      //delete  end Appointment
      for (const appointment of expiredAppointment) {
        const doctor = await Doctor.findById(appointment.doctor);
        if (doctor) {
          const hasOtherAppointment = await Appointment.exists({
            patient: appointment.patient,
            doctor: appointment.doctor,
            appointmentDate: { $gt: endOfDay },
          });
          if (!hasOtherAppointment) {
            doctor.patients = doctor.patients.filter(
              (patientId) =>
                patientId.toString() !== appointment.patient.toString()
            );
            await doctor.save();
          }
        }
        await Appointment.findByIdAndDelete(appointment._id);
      }
      console.log("Ended Appointment has deleted");
    } catch (err) {
      console.log("ERROR CRON");
    }
  });
};

module.exports = cleanupAppointments;
