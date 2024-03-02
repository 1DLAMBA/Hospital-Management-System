import { ClientResource } from "./client.model";
import { DoctorResource } from "./doctor.model";
import { NurseResource } from "./nurse.model";

export interface Asisigment{
    id: number,
    assigned_doctor_id: number,
    assigned_nurse_id:number,
    assigned_client_id:number,
    status: string,
    doctor: DoctorResource,
    nurse: NurseResource,
    client: ClientResource
}