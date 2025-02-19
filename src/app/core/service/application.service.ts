import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { environment } from '../../../environments/environment.development';

export interface ApplicationInstanceRequest {
  ApplicationGuid: string;
  // ApplicationIdentifier: string| null;
  // ApplicationName: string ;
  TenantGuid: string;
}

@Injectable({
  providedIn: 'root'
})
export class ApplicationService {
  constructor(private http: HttpClient) {}

  // Fetch the progress tracker data for the given application GUID
  fetchProgressTrackerData(guid: string): Observable<any> {
    return this.http.get(`${environment.baseUrl}/ApplicationStep/AllApplicationStep/${guid}`); 
  }
  fetchProgressTrackerInstanceDate(appGuid:string):Observable<any> {
    return this.http.get(`${environment.baseUrl}/ApplicationInstanceStep/AllApplicationInstanceStepByUserId/${appGuid}`)
  }

  // Make a GET request to fetch all applications --> for Home page
  getAllApplications(): Observable<any> {
    return this.http.get(`${environment.baseUrl}/Application/`);
  }

  // Make a POST request to create a applicationInstance --> from Home page
  createApplicationInstance(request: ApplicationInstanceRequest, token: string): Observable<any> {
    return this.http.post(`${environment.baseUrl}/ApplicationInstance`, request, {
      headers: {
        "Authorization": `Bearer ${token}`
      }
    });
  }

  // Make a GET request to fetch all the application Instance for logged in user --> for my-application page 
  getAllApplicationInstanceForUser(): Observable<any> {
    return this.http.get(`${environment.baseUrl}/ApplicationInstance`);
  }
  createApplicationInstanceStep(appGuid: string): Observable<any>{
    return this.http.post(`${environment.baseUrl}/ApplicationInstanceStep`, {applicationStepGuid:appGuid});
  }
  fetchStepswithInstances(appInstanceGuid:string): Observable<any> {
    return this.http.get(`${environment.baseUrl}/ApplicationInstance/Get/${appInstanceGuid}`);
  }
  fetchWebformAndDocumentCollectionForStep(appInstanceGuid:string,appStepGuid: string): Observable<any> {
    return this.http.get(`${environment.baseUrl}/ApplicationStep/${appInstanceGuid}/${appStepGuid}`);
  }
  createUser(token:string): Observable<any> {
    return this.http.post(`${environment.baseUrl}/Users/CreateUser`, {}, {
      headers: {
        "Authorization": `Bearer ${token}`
      }
    });
  }
  getUserProfile(token:string): Observable<any> {
    return this.http.get(`${environment.baseUrl}/Users/GetUser`, {
      headers: {
        "Authorization": `Bearer ${token}`
      }
    });
  }
}
