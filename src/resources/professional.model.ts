import { UserResource } from "./user.model";
import { DoctorResource } from "./doctor.model";
import { OtherProfessionalResource } from "./other-professional.model";

// Unified interface for both doctors and other professionals
export interface ProfessionalResource {
    id: number;
    type: 'doctor' | 'other_professional';
    displayType: string; // "Doctor" or the professional_type (e.g., "Public Health", "Physiologist")
    user: UserResource;
    specialization: string;
    license_number: string;
    med_school: string;
    grad_year: string;
    degree_file?: string | null;
    availability?: string; // For doctors
    // For other professionals
    professional_type?: string;
    // Original resources for reference
    doctor?: DoctorResource;
    otherProfessional?: OtherProfessionalResource;
}

