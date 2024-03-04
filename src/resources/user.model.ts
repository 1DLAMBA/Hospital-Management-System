export interface UserResource{
    id: number;
    name:string;
    email: string;
    password:string;
    phoneno: number;
    gender: string;
    user_type: string;
    passport: string;
    created_at: Date;
    updated_at: Date;

};

export interface UserDTO{
    name:string;
    email: string;
    password:string;
    phoneno: number;
    gender: string;
    user_type: string;
    passport: string;
}

export interface UserRequest{
    
    email: string;
    password: string;

};