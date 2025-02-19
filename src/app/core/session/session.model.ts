// session.model.ts
export interface Session {
    userId: string;
    token: string;
    userType:string;
    userAccessType:string|null;
    isAuthenticated: boolean;
    selectedFormGuid: string;
    selectedApplicationGuid: string;
    webFormInstanceGuid: string;
    selectFilloutIdentifier: string;
    employerName:string|null;
    employerSchedulingFormId:string|null;
}

export interface SessionState {
    session: Session | null;
}
