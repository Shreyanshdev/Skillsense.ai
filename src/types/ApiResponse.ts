export interface ApiResponse<T> {
    success: boolean;
    message: string;
    isAcceptingMessages?: boolean;
}