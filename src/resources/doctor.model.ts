import { UserResource } from "./user.model";

export interface DoctorResource {
    id: number,
    user_id:number,
    license_number: string,
    med_school: string,
    specialization: string,
    grad_year: string,
    degree_file: string,
    signature?: string,
    id_card?: string,
    availability: string,
    user: UserResource
}

export interface DoctorRequest {
    user_id:number,
    license_number: string,
    med_school: string,
    specialization: string,
    grad_year: string,
    degree_file: string,
}