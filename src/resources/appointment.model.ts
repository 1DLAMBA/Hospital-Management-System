import { ClientResource } from "./client.model";
import { DoctorResource } from "./doctor.model";
import { NurseResource } from "./nurse.model";
import { OtherProfessionalResource } from "./other-professional.model";

export interface AppointmentResource{
    id: number,
    doctor_id: number | null,
    other_professional_id: number | null,
    nurse_id: number | null,
    client_id:number,
    status: string,
    symptoms: string,
    doctor?: DoctorResource,
    nurse?: NurseResource,
    other_professional?: OtherProfessionalResource,
    client: ClientResource,
    date_time: Date,
    amount?: number | null,
    platform_fee?: number | null,
    professional_amount?: number | null,
    payment_status?: 'not_required' | 'unpaid' | 'pending' | 'paid' | 'failed',
    payment_reference?: string | null,
    paid_at?: string | null,
    is_free_first?: boolean
}

export interface AppointmentRequest{
    doctor_id?: number | null,
    other_professional_id?: number | null,
    nurse_id?: number | null,
    client_id:number,
    status: string,
    symptoms: string,
    date_time: string
}