import { ClientResource } from "./client.model";
import { DoctorResource } from "./doctor.model";

export interface AppointmentResource{
    id: number,
    doctor_id: number,
    client_id:number,
    status: string,
    symptoms: string,
    doctor: DoctorResource,
    client: ClientResource,
    date_time: Date
}

export interface AppointmentRequest{
    doctor_id: number,
    client_id:number,
    status: string,
    symptoms: string,
    date_time: string
}