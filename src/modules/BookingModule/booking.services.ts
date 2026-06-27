import { Request, Response, NextFunction } from "express";
import { ApplicationError } from "../../utilis/errors/types";
import { successHandler } from "../../utilis/successHandler";
import { BookingRebo } from "../../DB/repos/BookingRebo";

export class AppointmentService {
    private appointmentModel = new BookingRebo
    createAppointment = async (req: Request, res: Response, next: NextFunction) => {
        const patient = res.locals.user;
        const {
            doctorId,
            appointmentType,
            clinicType,
            telephonyType,
            appointmentDate,
            timeSlot,
            fees
        } = req.body;

        if (clinicType === 'online' && !['voice', 'video'].includes(telephonyType)) {
            throw new ApplicationError("Online appointments must specify telephonyType as either 'voice' or 'video'.", 400);
        }

        try {
            const patientBusy = await this.appointmentModel.findOne({
                filter: {
                    patientId: patient._id,
                    appointmentDate: new Date(appointmentDate),
                    timeSlot,
                    status: { $ne: 'cancelled' }
                }
            } as any);

            if (patientBusy) {
                throw new ApplicationError("You already have another appointment booked at this exact time slot.", 400);
            }

            const newAppointment = await this.appointmentModel.create({
                doc: {
                    patientId: patient._id,
                    doctorId,
                    appointmentType,
                    clinicType,
                    telephonyType: clinicType === 'online' ? telephonyType : null,
                    appointmentDate: new Date(appointmentDate),
                    timeSlot,
                    fees
                }
            });

            return successHandler({
                res,
                message: "Appointment booked successfully!",
                data: newAppointment
            });

        } catch (error: any) {
            if (error.code === 11000) {
                throw new ApplicationError("This time slot has already been booked by another patient.", 400);
            }
            next(error);
        }
    };
    cancelAppointment = async (req: Request, res: Response, next: NextFunction) => {
        const user = res.locals.user;
        const { appointmentId } = req.body;
        try {
            const appointment = await this.appointmentModel.findOne({
                filter: { _id: appointmentId }
            } as any);

            if (!appointment) {
                throw new ApplicationError("Appointment not found.", 404);
            }

            const isPatient = appointment.patientId.toString() === user._id.toString();
            const isDoctor = appointment.doctorId.toString() === user._id.toString();

            if (!isPatient && !isDoctor) {
                throw new ApplicationError("You do not have permission to cancel this appointment.", 403);
            }

            if (appointment.status === 'cancelled') {
                throw new ApplicationError("This appointment is already cancelled.", 400);
            }
            if (appointment.status === 'completed') {
                throw new ApplicationError("Cannot cancel a completed appointment.", 400);
            }

            const updatedAppointment = await this.appointmentModel.findByIdAndUpdate(
                appointmentId as string,
                { status: 'cancelled' },
                { new: true }
            );

            return successHandler({
                res,
                message: "Appointment cancelled successfully.",
                data: updatedAppointment
            });

        } catch (error) {
            next(error);
        }
    };
    getBookedSlots = async (req: Request, res: Response, next: NextFunction): Promise<Response> => {
        const { doctorId, date } = req.body;

        if (!doctorId || !date) {
            throw new ApplicationError("Both 'doctorId' and 'date' are required fields in the request body.", 400);
        }


        const bookedAppointments = await this.appointmentModel.find({
            filter: {
                doctorId: doctorId,
                appointmentDate: new Date(date as string),
                status: { $ne: 'cancelled' }
            }
        } as any);


        const busySlots = bookedAppointments.map(app => app.timeSlot);

        return successHandler({
            res,
            message: "Booked slots retrieved successfully for this date.",
            data: {
                date,
                bookedSlots: busySlots
            }
        });


    };
}