import { OtherProfessionalResource } from "./other-professional.model";

export interface UserResource{
    id: number;
    name:string;
    email: string;
    password:string;
    phoneno: number;
    gender: string;
    user_type: string;
    passport: string;
    email_verified_at?: Date | string | null;
    created_at: Date;
    updated_at: Date;
    other_professionals?: OtherProfessionalResource;
    doctors?: any;
    nurses?: any;
    requires_professional_profile?: boolean;
    registration_complete?: boolean;
    can_respond_to_consultations?: boolean;
};

export interface UserDTO{
    name:string;
    email: string;
    password:string;
    phoneno: number;
    gender: string;
    user_type: string;
    passport?: string;
}

export interface UserRequest{
    
    email: string;
    password: string;

};