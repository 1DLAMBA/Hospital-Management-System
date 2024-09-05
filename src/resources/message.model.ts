export interface MessageResource{
    id: number,
    sender_id: number,
    receiver_id: number,
    read_at: string,
    message: string,
}