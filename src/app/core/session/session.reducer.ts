// session.reducer.ts
import { createReducer, on } from '@ngrx/store';
import { clearSelectedApplicationGuid, clearSelectedFilloutIdentifier, clearSelectedFormGuid, clearWebFormInstanceGuid, login, loginSuccess, logout, setSelectedApplicationGuid, setSelectedFilloutIdentifier, setSelectedFormGuid, setSession, setUserType, setWebFormInstanceGuid } from './session.actions';
import { SessionState } from './session.model';

export const initialState: SessionState = {
    session: null,
};

const _sessionReducer = createReducer(
    initialState,
    on(login, (state, { userId, token, userType, userAccessType , employerName, employerSchedulingFormId}) => ({
        ...state,
        session: { userId, token, userType, userAccessType, employerName, employerSchedulingFormId, isAuthenticated: true, selectedFormGuid: null, webFormInstanceGuid: null, selectedApplicationGuid: null, selectFilloutIdentifier: null, },
    })),
    on(loginSuccess, (state, { session }) => ({
        ...state,
        session: session,
    })),
    on(logout, (state) => ({
        ...state,
        session: null,
    })),
    on(setSession, (state, { session }) => ({
        ...state,
        session,
    })),
    on(setSelectedFormGuid, (state, { formGuid }) => ({
        ...state,
        session: { ...state.session, selectedFormGuid: formGuid },
    })),
    on(clearSelectedFormGuid, (state) => ({
        ...state,
        session: { ...state.session, selectedFormGuid: '' },
    })),
    on(setWebFormInstanceGuid, (state, { webFormInstanceGuid }) => ({
        ...state,
        session: { ...state.session, webFormInstanceGuid: webFormInstanceGuid },
    })),
    on(setSelectedApplicationGuid, (state, { selectedApplicationGuid }) => ({
        ...state,
        session: { ...state.session, selectedApplicationGuid: selectedApplicationGuid },
    })),
    on(clearSelectedApplicationGuid, (state) => ({
        ...state,
        session: { ...state.session, applicationGuid: '' },
    })),
    on(setSelectedFilloutIdentifier, (state, { filloutIdentifier }) => ({
        ...state,
        session: { ...state.session, selectFilloutIdentifier: filloutIdentifier },
    })),
    on(setUserType, (state, {userType}) => ({
        ...state,
        session: { ...state.session, userType },
    })),
    on(clearSelectedFilloutIdentifier, (state) => ({
        ...state,
        session: { ...state.session, selectFilloutIdentifier: '' },
    })),
    on(clearWebFormInstanceGuid, (state) => ({
        ...state,
        session: { ...state.session, webFormInstanceGuid: '' },
    })),
    
    
);

export function sessionReducer(state, action) {
    return _sessionReducer(state, action);
}
