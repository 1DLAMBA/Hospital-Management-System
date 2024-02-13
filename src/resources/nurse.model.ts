import { UserResource } from "./user.model";

export interface NurseResource {
    id: number,
    user_id:number,
    license_number: string,
    med_school: string,
    specialization: string,
    grad_year: string,
    degree_file: string,
    availability: string,
    created_by: UserResource
}