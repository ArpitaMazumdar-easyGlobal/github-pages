import { Injectable } from '@angular/core';
import {
  HttpRequest,
  HttpHandler,
  HttpEvent,
  HttpInterceptor
} from '@angular/common/http';
import { Observable } from 'rxjs';
import { Store } from '@ngrx/store';
import { getTokenFromSession } from '../session/session.selectors';
 
@Injectable()
export class auth0TokenInterceptor implements HttpInterceptor {
  private tokenFromSession: Observable<string | null>;
  private token: string = "";
 
  constructor(private store: Store) {}
 
  intercept(request: HttpRequest<unknown>, next: HttpHandler): Observable<HttpEvent<unknown>> {
    this.tokenFromSession = this.store.select(getTokenFromSession);
    this.tokenFromSession.subscribe(token => {
      this.token = token;
    })
    if(this.token == null){
      return next.handle(request);
    }
    const modifiedRequest = request.clone({
      headers: request.headers.set('Authorization', `Bearer ${this.token}`)
      .set('ngrok-skip-browser-warning', 'true')
    })
    return next.handle(modifiedRequest);
  }
}