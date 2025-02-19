import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { catchError, Observable, of } from 'rxjs';
import { environment } from '../../../environments/environment.development';
import { saveAs } from 'file-saver';
import { ApiPaths } from '../../../util/ApiEnum';
import { UpdateDocumentRequestStatus } from '../../../util/types';

interface Document {
  type: string;
  status: string;
  action: string;
  documentTypeGuid: string;
  documentRequestGuid:string;
  documentRequestActivityGuid: string;
  documentRequestDocumentsGuid: string;
  documentUrl: string;
  applicationInstanceGuid: string;
  applicationStepInstanceGuid:string;
}

@Injectable({
  providedIn: 'root'
})
export class DocumentService {
  constructor(private http: HttpClient) {}
  getDocumentRequests(): Observable<any> {
    return this.http.get(`${environment.documentApiBaseUrl}/DocumentRequest/ByUserId`); 
  }
  downloadFile(url: string): Observable<Blob> {
    return this.http.get(url, { responseType: 'blob' }).pipe(
      catchError((error) => {
        return of(null);
      })
    );
  }
  saveFile(blob: Blob, filename: string): void {
    saveAs(blob, filename);
  }
  uploadDocument(file: File, documentData: Document): Observable<any> {
    const formData = new FormData();
    formData.append('UploadFile', file);
    formData.append('DocumentRequestGuid', documentData.documentRequestGuid);
    formData.append('DocumentRequestActivityGuid', documentData.documentRequestActivityGuid);
    formData.append('DocumentRequestDocumentsGuid', documentData.documentRequestDocumentsGuid);
    formData.append('ActivityStatus', 'PENDING'); 

    const apiUrl = `${environment.documentApiBaseUrl}/DocumentRequest/Upload`;
    return this.http.post(apiUrl, formData);
  }

  uploadApplicationDocument(file: File, documentData: Document): Observable<any> {
    const formData = new FormData();
    formData.append('File', file);
    formData.append('DocumentTypeGuid', documentData.documentTypeGuid);
    formData.append('ApplicationInstanceStepGuid', documentData.applicationStepInstanceGuid);

    const apiUrl = `${environment.documentApiBaseUrl}${ApiPaths.UploadApplicationDocument}`;
    // const apiUrl = `${environment.documentApiBaseUrl}/ApplicationStep/Upload`;
    return this.http.post(apiUrl, formData);
  }

  getApplicationDocumentTypes(applicationGuid: string): Observable<any> {
    return this.http.get(`${environment.documentApiBaseUrl}${ApiPaths.GetApplicationDocumentTypes}/${applicationGuid}`); 
  }
  fetchApplicationInstanceStepDocuments(appInstanceStepGuid:string):Observable<any>{
    return this.http.get(`${environment.baseUrl}/ApplicationInstanceStepDocuments/applicationStepDocuments/${appInstanceStepGuid}`)
  }

  updateDocumentrequest(updateDocumentRequest: UpdateDocumentRequestStatus): Observable<any>{
    return this.http.put(`${environment.baseUrl}${ApiPaths.UpdateDocumentRequestStatus}`, updateDocumentRequest);
  }

  approveApplicationInstanceStepDocument(applicationInstanceStepDocumentsGuid: string): Observable<any>{
    return this.http.patch(`${environment.baseUrl}${ApiPaths.ApproveApplicationInstanceStepDocument}/${applicationInstanceStepDocumentsGuid}`, new FormData());
  }

  rejectApplicationInstanceStepDocument(applicationInstanceStepDocumentsGuid: string): Observable<any>{
    return this.http.patch(`${environment.baseUrl}${ApiPaths.RejectApplicationInstanceStepDocument}/${applicationInstanceStepDocumentsGuid}`, new FormData());
  }

  getDocumentRequestsByUserIdForAdmin(userId: string): Observable<any> {
    return this.http.get(`${environment.documentApiBaseUrl}/DocumentRequest/Admin/${userId}`); 
  }

  downladFileByDocId(docReqDocGuid:string):Observable<any> {
    return this.http.get<any>(`${environment.baseUrl}${ApiPaths.DocumemtRequestDocumentDownload}/${docReqDocGuid}`,{
      observe:'response',
      responseType:'blob' as 'json'
    });
  }
}
