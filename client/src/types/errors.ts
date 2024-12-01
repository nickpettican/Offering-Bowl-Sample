export enum AuthErrorType {
    SESSION_EXPIRED = "SESSION_EXPIRED",
    NETWORK_ERROR = "NETWORK_ERROR",
    UNKNOWN = "UNKNOWN"
}

export interface AuthError {
    type: AuthErrorType;
    message: string;
}
