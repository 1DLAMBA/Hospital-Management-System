export interface UserResource{
    id: number;
    email: string;
    password:string;
    phoneno: number;
    gender: string;
    user_type: string;
    passport: string;
    created_at: Date;
    updated_at: Date;

};

export interface UserRequest{
    
    email: string;
    password: string;

};