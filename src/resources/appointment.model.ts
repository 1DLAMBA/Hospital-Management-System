import { ClientResource } from "./client.model";
import { DoctorResource } from "./doctor.model";

export interface AppointmentResource{
    id: number,
    doctor_id: number,
    client_id:number,
    status: string,
    doctor: DoctorResource,
    client: ClientResource,
    date_time: string
}