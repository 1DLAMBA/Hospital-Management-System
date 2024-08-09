import { ClientResource } from "./client.model";
import { DoctorResource } from "./doctor.model";
import { NurseResource } from "./nurse.model";

export interface AssigmentResourse{
    id: number,
    assigned_doctor_id: number,
    assigned_nurse_id:number,
    assigned_client_id:number,
    assignment_message:string,
    status: string,
    doctor: DoctorResource,
    nurse: NurseResource,
    client: ClientResource
}

export interface AssigmentRequest{
    assigned_doctor_id: number,
    assigned_nurse_id:number,
    assigned_client_id:number,
    assignment_message:string,
    status: string,
}