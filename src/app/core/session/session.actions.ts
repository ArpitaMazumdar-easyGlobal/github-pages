// session.actions.ts
import { createAction, props } from '@ngrx/store';
import { Session } from './session.model';

export const login = createAction(
    '[Session] Login',
    props<{ userId: string; token: string, userType:string, userAccessType:string|null , employerName:string|null, employerSchedulingFormId:string|null}>()
);

export const loginSuccess = createAction(
    '[Session] Login Success',
    props<{ session: Session }>()
);

export const logout = createAction('[Session] Logout');

export const setSession = createAction(
    '[Session] Set Session',
    props<{ session: Session }>()
);
export const setUserType = createAction('[Session] Set User Type', props<{userType:string}>())
export const setSelectedFormGuid = createAction(
    '[Session] Set Selected Form GUID',
    props<{ formGuid: string }>()
);

export const setSelectedApplicationGuid = createAction(
    '[Session] Set Selected Application GUID',
    props<{ selectedApplicationGuid: string }>()
);
export const setSelectedFilloutIdentifier = createAction(
    '[Session] Set Selected Fillout Identifier',
    props<{ filloutIdentifier: string }>()
);
export const clearSelectedApplicationGuid = createAction('[Session] Clear Selected Application GUID');
export const clearSelectedFilloutIdentifier = createAction('[Session] Clear Selected Application GUID');

export const clearSelectedFormGuid = createAction('[Session] Clear Selected Form GUID');

export const setWebFormInstanceGuid = createAction(
    '[Session] Set Web Form Instance GUID',
    props<{ webFormInstanceGuid: string }>()
);

export const clearWebFormInstanceGuid = createAction('[Session] Clear Web Form Instance GUID');


