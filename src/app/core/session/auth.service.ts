// auth.service.ts
import { Injectable } from '@angular/core';
import { Observable, of } from 'rxjs';
import { Session } from './session.model';

@Injectable({
    providedIn: 'root',
})
export class AuthService {
    login(userId: string, token: string, userType:string, userAccessType, employerName:string|null, employerSchedulingFormId:string|null): Observable<Session> {
        // Simulate an API call
        const session: Session = { userId, token,userAccessType,employerName, employerSchedulingFormId,isAuthenticated: true, selectedFormGuid: null, webFormInstanceGuid: null, selectedApplicationGuid: null, selectFilloutIdentifier: null, userType };
        return of(session); // Replace with an actual API call
    }
}
