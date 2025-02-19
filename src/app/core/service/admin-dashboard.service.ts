import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { Observable } from 'rxjs';
import { environment } from '../../../environments/environment.development';
import { Application, ApplicationStep, AutoFillRequest, Invite, NewApplication, RequestBodyForDocumentRequest } from '../../../util/types';

export interface UpdateEmployer {
  calendlyBookingLink: string|null;
  schedulingFormId:string|null;
}

export interface UpdateUser {
  firstName: string;
  lastName: string;
  mobileNumber: string;
  userEmail: string;
  accessType?: string
}

@Injectable({
  providedIn: 'root',
})
export class AdminDashboardService {
  constructor(private http: HttpClient) {}

  getAllEmployers(): Observable<any> {
    return this.http.get(`${environment.baseUrl}/Employer/GetAllEmployers`);
  }

  getEmployer(employerGuid: string): Observable<any> {
    return this.http.get(
      `${environment.baseUrl}/Employer/GetEmployer/${employerGuid}`
    );
  }

  updateEmployer(
    employerGuid: string,
    updateBody: UpdateEmployer
  ): Observable<any> {
    return this.http.put(
      `${environment.baseUrl}/Employer/UpdateEmployerCalendly/${employerGuid}`,
      updateBody
    );
  }

  updateUser(userGuid: string, updateBody: UpdateUser): Observable<any> {
    return this.http.put(
      `${environment.baseUrl}/Users/${userGuid}`,
      updateBody
    );
  }
  updateEmployerUser(employerUserGuid:string, updateBody:UpdateUser): Observable<any> {
    return this.http.put(
      `${environment.baseUrl}/EmployerUser/${employerUserGuid}`,
      updateBody
    );
  }
  deleteEmployer(employerGuid: string): Observable<any> {
    return this.http.delete(`${environment.baseUrl}/Employer/${employerGuid}`);
  }
  deleteEmployerUser(employerUserGuid:string): Observable<any> {
    return this.http.delete(
      `${environment.baseUrl}/EmployerUser/${employerUserGuid}`);
  }
  deleteUser(userGuid: string): Observable<any> {
    return this.http.delete(`${environment.baseUrl}/Users/${userGuid}`);
  }
  fetchAllApplications():Observable<any> {
    return this.http.get(`${environment.baseUrl}/Application`);
  }
  createApplicationInstanceStep(appInstanceGuid:string, stepGuid:string):Observable<any> {
    return this.http.post(`${environment.baseUrl}/ApplicationInstanceStep`,
      {
        applicationStepGuid: stepGuid,
        applicationInstanceGuid:appInstanceGuid,
        tenantGuid: "B6FCC1F1-2F7F-4ADC-9C07-09D06651197D"
    }
    );
  }
  updateApplicationInstanceStep(appInstanceGuid:string, instanceStepGuid:string):Observable<any> {
    return this.http.put(`${environment.baseUrl}/ApplicationInstanceStep/${appInstanceGuid}/${instanceStepGuid}`,{});
  }
  addAutoFillRecord(autoFillRequest: AutoFillRequest):Observable<any>{
    return this.http.post(`${environment.baseUrl}/WebFormInstance_Autofill`,autoFillRequest);
  }

  createApplication(reqbody:NewApplication):Observable<any>{
    return this.http.post(`${environment.baseUrl}/Application`,reqbody);
  }
  updateApplication(appGuid:string, reqbody:NewApplication):Observable<any>{
    return this.http.patch(`${environment.baseUrl}/Application/${appGuid}`,reqbody);
  }
  deleteApplication(appGuid:string):Observable<any>{
    return this.http.delete(`${environment.baseUrl}/Application/${appGuid}`);
  }
    
  getAllApplicants():Observable<any> {
    return this.http.get(`${environment.baseUrl}/Users/GetAllApplicants`);
  }

  getUser(userGuid: string): Observable<any> {
    return this.http.get(`${environment.baseUrl}/Users/GetUser/${userGuid}`);
  }
  sendEmployerInnvite(invite:Invite):Observable<any>{
    return this.http.post(`${environment.baseUrl}/Employer/Invite`, invite);
  }

  getAllDocumentRequest(): Observable<any>{
    return this.http.get(`${environment.baseUrl}/DocumentRequest/all`);
  }

  getUserInfo(): Observable<any>{
    return this.http.get(`${environment.baseUrl}/Users/GetUser`);
  }

  createDocumentRequest(reqBody: RequestBodyForDocumentRequest): Observable<any>{
    return this.http.post(`${environment.baseUrl}/DocumentRequest`, reqBody);
  }
  getApplicationDetails(appGuid:string):Observable<any>{
    return this.http.get(`${environment.baseUrl}/Application/${appGuid}`);
  }
  createApplicationStep(body:ApplicationStep):Observable<any>{
    return this.http.post(`${environment.baseUrl}/ApplicationStep`,body);
  }
  deleteApplicationStep(appStepGuid:string):Observable<any>{
    return this.http.delete(`${environment.baseUrl}/ApplicationStep/${appStepGuid}`);
  }
  updateApplicationStep(appStepGuid:string, step:ApplicationStep):Observable<any>{
    return this.http.put(`${environment.baseUrl}/ApplicationStep/${appStepGuid}`, step);
  }
  getAllWebForms():Observable<any>{
    return this.http.get(`${environment.baseUrl}/WebForm/all`);
  }
  getAllDocumentType():Observable<any>{
    return this.http.get(`${environment.baseUrl}/DocumentType`);
  }
  addWebFormToStep(reqbody:any):Observable<any>{
    return this.http.post(`${environment.baseUrl}/ApplicationStep_WebForm`, reqbody);
  }
  createWebForm(reqbody):Observable<any>{
    return this.http.post(`${environment.baseUrl}/WebForm`, reqbody);
  } 
  addDocumentToStep(reqbody:any):Observable<any>{
    return this.http.post(`${environment.baseUrl}/ApplicationStepDocumentCollection`, reqbody);
  }
  createDocumentType(reqbody):Observable<any>{
    return this.http.post(`${environment.baseUrl}/DocumentType`, reqbody);
  }
  deleteWebFormFromStep(appStepWebFormGuid:string):Observable<any>{
    return this.http.delete(`${environment.baseUrl}/ApplicationStep_WebForm/${appStepWebFormGuid}`);
  }
  deleteDocumentTypeFromStep(appStepDocTypeGuid:string):Observable<any>{
    return this.http.delete(`${environment.baseUrl}/ApplicationStepDocumentCollection/${appStepDocTypeGuid}`);
  }
  deleteWebForm(webFormGuid:any):Observable<any>{
    return this.http.delete(`${environment.baseUrl}/WebForm/${webFormGuid}`);
  }
  deleteDocumentType(documentTypeGuid:any):Observable<any>{
    return this.http.delete(`${environment.baseUrl}/DocumentType/${documentTypeGuid}`);
  }
  getAllMatchedCandidates(empGuid:string):Observable<any>{
    return this.http.get(`${environment.baseUrl}/MatchedCandidates/Employer/${empGuid}`);
  }
}
