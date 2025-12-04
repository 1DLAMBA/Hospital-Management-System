import { AppointmentResource } from "./appointment.model";
import { DoctorResource } from "./doctor.model";
import { NurseResource } from "./nurse.model";
import { UserResource } from "./user.model";

export interface ClientResource {
    id: number,
    user_id:number,
    assigned_doctor_id:number,
    appointment_id:number,
    assigned_nurse_id:number,
    date_of_birth: string,
    appointments: AppointmentResource,
    doctors: DoctorResource,
    nurse: NurseResource,
    created_by: UserResource,
    user?: UserResource
}

export interface ClientsRequest{
    user_id:number,
    date_of_birth: string,
}