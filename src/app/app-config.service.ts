import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { environment } from '../environments/environment.development';
import { ApiPaths } from '../util/ApiEnum';
import { BehaviorSubject, firstValueFrom } from 'rxjs';

@Injectable({
  providedIn: 'root'
})
export class AppConfigService {
  constructor(private http: HttpClient) {}
  private tenantGuidSubject = new BehaviorSubject<string>('');

  tenantGuidSubject$ = this.tenantGuidSubject.asObservable();

  updateTenantGuidSubject(data: string) {
    this.tenantGuidSubject.next(data);
  }

  private config = {
    auth0Domain: '',
    auth0ClientId: '',
    tenantGuid: '',
    audience: ''
  };
  baseUrl = environment.baseUrl;

  loadConfig(): Promise<void> {
    const originUrl = window.location.origin;
    const hostname = new URL(originUrl).hostname;
    var apiUrl = `${this.baseUrl +"/Tenant" + ApiPaths.GetTenant}/${hostname}`;


    return firstValueFrom(this.http.get(apiUrl))
      .then((data: any) => {
        this.config.auth0Domain = data.auth0Domain;
        this.config.auth0ClientId = data.auth0ClientId;
        this.config.tenantGuid = data.tenantGuid;
        this.config.audience = "https://easyglobal/"
        this.updateTenantGuidSubject(data.tenantGuid);
      })
      .catch(error => {
        console.error('Failed to load configuration', error);
        return Promise.resolve();
      });
  }

  get auth0Domain() {
    return this.config.auth0Domain;
  }

  get auth0ClientId() {
    return this.config.auth0ClientId;
  }

  get tenantGuid() {
    return this.config.tenantGuid;
  }

  get audience() {
    return this.config.audience;
  }
}
