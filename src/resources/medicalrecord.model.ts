import { ClientResource } from "./client.model";
import { DoctorResource } from "./doctor.model";

export interface MedicalRecordResource{
    id: number,
    assigned_doctor_id: number,
    record_number:number,
    client_id:number,
    diagnosis:number,
    past_diagnosis:number,
    allergies: string,
    treatment: string,
    client: ClientResource,
    doctor: DoctorResource
}
export interface MedicalRecordRequest{
    assigned_doctor_id: number,
    record_number:number,
    client_id:number,
    diagnosis:string,
    past_diagnosis:string,
    allergies: string,
    treatment: string,
}