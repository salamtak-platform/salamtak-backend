import { Types } from "mongoose";

export interface IAppointment {
    patientId: Types.ObjectId;
    doctorId: Types.ObjectId;
    appointmentType: 'consultation' | 'examination';
    clinicType: 'online' | 'physical';
    telephonyType?: 'voice' | 'video' | null;
    appointmentDate: Date;      
    timeSlot: string;           
    status: 'pending' | 'confirmed' | 'cancelled' | 'completed';
    fees: number;
}