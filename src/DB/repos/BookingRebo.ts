import { Model } from "mongoose";
import { IAppointment } from "../../modules/BookingModule/booking.types";
import { DBRebo } from "../DBRepo";
import { appointmentModel } from "../models/BookingModel/bookingModel";

export class BookingRebo extends DBRebo<IAppointment>{
    constructor(protected override model:Model<IAppointment> =appointmentModel){super(appointmentModel)}
}