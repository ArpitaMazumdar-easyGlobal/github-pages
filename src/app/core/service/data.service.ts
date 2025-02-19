import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { catchError, Observable } from 'rxjs';
import { environment } from '../../../environments/environment.development';
import { ApiPaths } from '../../../util/ApiEnum';
import { AddInterview, Invite, MatchedCandidate } from '../../../util/types';

@Injectable({
  providedIn: 'root'
})
export class DataService {

  baseUrl = environment.baseUrl;

  constructor(private http: HttpClient) {}

  // Method to get data as an Observable
  getWebFormJson(webFormGuid: string): Observable<any> {
    return this.http.get<any>(this.baseUrl +'/WebForm/'+ webFormGuid).pipe(
      catchError(error => {
        console.error('Error occurred:', error);
        return error;
      })
    )
  }
  
  fetchApplicationInstanceStepWebforms(appInstanceStepGuid:string):Observable<any>{
    return this.http.get(`${environment.baseUrl}/ApplicationInstanceStepWebformInstance/${appInstanceStepGuid}`)
  }
  createWebFormInstance(webFormGuid: string, reqBody:any, instanceStepGuid:string): Observable<any> {
    return this.http.post<any>(`${this.baseUrl +"/WebForm" + ApiPaths.CreateInstance}/${webFormGuid}/${instanceStepGuid}`,reqBody);
  }

  saveWebFormData(requestBody: any): Observable<any> {
    return this.http.post<any>(this.baseUrl+"/WebForm" + ApiPaths.SaveInstanceAnswer, requestBody);
  }
  
  getAllWebFroms(): Observable<any> {
    return this.http.get<any>(this.baseUrl +"/WebForm" + ApiPaths.GetAllForms).pipe(
      catchError(error => {
        console.error('Error occurred:', error);
        return error;
      })
    )
  }
  getAllWebFormsForApplication(applicationGuid:string): Observable <any>{
    return this.http.get<any>(`${this.baseUrl}/WebForm_Application/${applicationGuid}`);
  }
  createContactHubspot(contactBody: any, token: string): Observable<any> {
    const contactApi = this.baseUrl + ApiPaths.CreateHubspotContact;
 
    return this.http.post<any>(
      contactApi,
      { properties: contactBody },
      {
        headers: {
          "Authorization": `Bearer ${token}`
        }
      }
    );
  }
  createWebFormInstanceApplication(webFormInstanceGuid: string, applicationGuid: string): Observable<any> {
    return this.http.post<any>(`${this.baseUrl}${ApiPaths.CreateWebFormInstanceApplication}`, 
      {
        webFormInstanceGuid,
        applicationGuid
      }
    );
  }
  getAnswersForFilledForm(webformInstanceGuid:string): Observable<any> {
    return this.http.get<any>(`${this.baseUrl}/FilloutForm/Submission/${webformInstanceGuid}`);
  }
  createWebFormInstanceAutofill(
    webFormInstanceGuid: string,
    webformGuid: string,
    parameterName: string,
    autofillValue: string
  ): Observable<any> {
    return this.http.post<any>(`${this.baseUrl}${ApiPaths.WebFormInstanceAutofill}`, 
      {
        webFormInstanceGuid,
        webformGuid,
        parameterName,
        autofillValue
      }
    );
  }
  getWebFormInstanceAutofill(webformInstanceGuid:string): Observable<any> {
    return this.http.get<any>(`${this.baseUrl}${ApiPaths.WebFormInstanceAutofill}/${webformInstanceGuid}`);
  }
  getAllMatchedCandidatesForEmployer(): Observable<MatchedCandidate[]> {
    return this.http.get<any>(`${this.baseUrl}/MatchedCandidates`);
  }
  getAllMatchedCandidatesForEmployerByEmployerGuid(employerGuid:string): Observable<MatchedCandidate[]> {
    return this.http.get<any>(`${this.baseUrl}/MatchedCandidates/Employer/${employerGuid}`);
  }
  downladFile(docGuid:string):Observable<any> {
    return this.http.get<any>(`${this.baseUrl}/Hubspot/FileDownload/${docGuid}`,{
      observe:'response',
      responseType:'blob' as 'json'
    });
  }
  updateMatchedCandidateStatus(matchedCandidateGuid:string, status:string):Observable<any> {
    return this.http.put<any>(`${this.baseUrl}/MatchedCandidates/${matchedCandidateGuid}`,{StatusValueCode:status});
  }
  sendBookInterviewRequest(matchedCandidateGuid:string):Observable<any> {
    return this.http.get<any>(`${this.baseUrl}/MatchedCandidates/sendInterviewLink/${matchedCandidateGuid}`);
  }
  getUpcomingInterviews():Observable<any>{
    return this.http.get<any>(`${this.baseUrl}/UpcomingInterview`)
  }
  getUpcomingInterviewForEmployer():Observable<any>{
    return this.http.get<any>(`${this.baseUrl}/UpcomingInterview/Employer`);
  }
  addUpcomingInterview(requestBody:AddInterview):Observable<any>{
    return this.http.post<any>(`${this.baseUrl}/UpcomingInterview`, requestBody);
  }
  updateUpcomingInterview(requestBody:AddInterview):Observable<any>{
    return this.http.put<any>(`${this.baseUrl}/UpcomingInterview/${requestBody.upcomingInterviewGuid}`, requestBody);
  }
  deleteUpcomingInterview(upcomingInterviewGuid):Observable<any>{
    return this.http.delete<any>(`${this.baseUrl}/UpcomingInterview/${upcomingInterviewGuid}`,);
  }
  getEmployerDashboardDataForEmployer():Observable<any>{
    return this.http.get<any>(`${this.baseUrl}/Employer/GetEmployer`);
  }
  sendInvite(reqBody:Invite):Observable<any>{
    return this.http.post<any>(`${this.baseUrl}/EmployerUser/Invite`, reqBody);
  }
  revokeInvite(inviteGuid:string):Observable<any>{
    return this.http.delete<any>(`${this.baseUrl}/Employer/RevokeInvite/${inviteGuid}`);
  }
}

