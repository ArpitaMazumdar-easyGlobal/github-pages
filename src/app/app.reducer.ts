import { Router } from '@angular/router';
import { ActionReducer, MetaReducer } from '@ngrx/store';

export function persistOnRefreshReducer(reducer: ActionReducer<any>): ActionReducer<any> {
  return function (state, action) {
    const nextState = reducer(state, action);

    if (action.type === 'APP_REFRESH') {
      // Save the current state to localStorage before refresh
      localStorage.setItem('appState', JSON.stringify(nextState));
      localStorage.setItem('latestUrl', window.location.href);
    }
    return nextState;
  };
}

export const metaReducers: MetaReducer<any>[] = [persistOnRefreshReducer];
