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
    user?: UserResource,
    created_by: UserResource,
    /** From API when listing nurses (full registration incl. docs & bank rules) */
    registration_complete?: boolean,
}

export interface NurseRequest {
    user_id:number,
    license_number: string,
    med_school: string,
    specialization: string,
    grad_year: string,
    degree_file: string,
}