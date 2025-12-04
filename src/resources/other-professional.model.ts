import { UserResource } from "./user.model";

export interface OtherProfessionalResource {
    id: number,
    user_id: number,
    professional_type: string,
    license_number: string,
    med_school: string,
    specialization: string,
    grad_year: string,
    degree_file: string | null,
    created_at?: string,
    updated_at?: string,
    user?: UserResource
}

export interface OtherProfessionalRequest {
    user_id: number,
    professional_type: string,
    license_number: string,
    med_school: string,
    specialization: string,
    grad_year: string,
    degree_file?: string | null,
}

