// session.effects.ts
import { Injectable } from '@angular/core';
import { Actions, ofType, createEffect } from '@ngrx/effects';
import { Store } from '@ngrx/store';
import { of } from 'rxjs';
import { catchError, map, mergeMap } from 'rxjs/operators';
import { AuthService } from './auth.service'; // Adjust path to your auth service
import { login, loginSuccess, setSession } from './session.actions';

@Injectable()
export class SessionEffects {
    constructor(private actions$: Actions, private authService: AuthService, private store: Store) {}

    login$ = createEffect(() =>
        this.actions$.pipe(
            ofType(login),
            mergeMap(({ userId, token, userType, userAccessType, employerName, employerSchedulingFormId}) =>
                this.authService.login(userId, token,userType,userAccessType, employerName, employerSchedulingFormId).pipe(
                    map(session => {
                        this.store.dispatch(setSession({ session }));
                        return loginSuccess({ session });
                    })
                )
            )
        )
    );
}
