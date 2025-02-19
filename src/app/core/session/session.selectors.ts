// session.selectors.ts
import { createFeatureSelector, createSelector } from '@ngrx/store';
import { SessionState } from './session.model';

export const selectSessionState = createFeatureSelector<SessionState>('session');

export const selectIsAuthenticated = createSelector(
    selectSessionState,
    (state: SessionState) => state.session?.isAuthenticated || false
);

export const selectCurrentSession = createSelector(
    selectSessionState,
    (state: SessionState) => state.session
);

export const selectSelectedFormGuid = createSelector(
    selectSessionState,
    (state: SessionState) => state.session?.selectedFormGuid
);

export const selectWebFormInstanceGuid = createSelector(
    selectSessionState,
    (state: SessionState) => state.session?.webFormInstanceGuid
);

export const selectApplicationGuid = createSelector(
    selectSessionState,
    (state: SessionState) => state.session?.selectedApplicationGuid
);

export const selectFilloutIdentifier = createSelector(
    selectSessionState,
    (state: SessionState) => state.session?.selectFilloutIdentifier
)
export const selectUserId = createSelector(
    selectSessionState,
    (state: SessionState) => state.session?.userId
)
export const selectUserType = createSelector(
    selectSessionState, 
    (state: SessionState) => {
        return state.session?.userType;
    }   
)
export const selectUserAccessType = createSelector(
    selectSessionState, 
    (state: SessionState) => {
        return state.session?.userAccessType;
    }   
)
export const selectEmployerName = createSelector(
    selectSessionState, 
    (state: SessionState) => {
        return state.session?.employerName;
    } 
);
export const selectEmployerSchedulingFormId= createSelector(
    selectSessionState, 
    (state: SessionState) => {
        return state.session?.employerSchedulingFormId;
    } 
);
export const getTokenFromSession = createSelector(selectSessionState, (state: SessionState)=> state.session.token);
 