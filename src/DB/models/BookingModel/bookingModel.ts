import { model, models, Schema } from "mongoose";
import { IAppointment } from "../../../modules/BookingModule/booking.types";

const appointmentSchema = new Schema<IAppointment>({
    patientId: { type: Schema.Types.ObjectId, ref: 'Patient', required: true },
    doctorId: { type: Schema.Types.ObjectId, ref: 'Provider', required: true },
    appointmentType: { 
        type: String, 
        enum: ['consultation', 'examination'], 
        required: true 
    },
    clinicType: { 
        type: String, 
        enum: ['online', 'physical'], 
        required: true 
    },
    telephonyType: { 
        type: String, 
        enum: ['voice', 'video'], 
        default: null,
    },
    appointmentDate: { type: Date, required: true },
    timeSlot: { type: String, required: true }, 
    status: { 
        type: String, 
        enum: ['pending', 'confirmed', 'cancelled', 'completed'], 
        default: 'confirmed' 
    },
    fees: { type: Number, required: true }
}, { timestamps: true });

appointmentSchema.index({ doctorId: 1, appointmentDate: 1, timeSlot: 1 }, { unique: true });

export const appointmentModel = models.Booking ||model<IAppointment>('Booking', appointmentSchema);