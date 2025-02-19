import { Component, OnInit } from "@angular/core";
import { CommonModule } from "@angular/common";
import { AuthService } from "@auth0/auth0-angular";
import { jwtDecode } from "jwt-decode";
import { DocumentService } from "../../core/service/document.service";
import { ChangeDetectorRef } from "@angular/core"; // Import ChangeDetectorRef
import { DocumentListingComponent } from "./document-listing/document-listing.component";
import { Store } from "@ngrx/store";
import { getTokenFromSession, selectUserType } from "../../core/session/session.selectors";
import { HttpClientModule } from "@angular/common/http";
import { ToastrService } from "ngx-toastr";
import { LoadingComponent } from "../../shared/loading/loading.component";
import { StatusUpdate } from "../../../util/types";
import { ActivatedRoute } from "@angular/router";

interface Document {
  type: string;
  status: string;
  action: string;
  documentTypeGuid: string;
  documentRequestGuid:string;
  documentRequestActivityGuid: string;
  documentRequestDocumentsGuid: string;
  documentUrl: string;
  requestedDate:Date,
  uploadedDate:Date
}
@Component({
  selector: "app-my-documents",
  standalone: true,
  imports: [
    CommonModule,
    DocumentListingComponent,
    HttpClientModule,
    LoadingComponent
  ],
  templateUrl: "./my-documents.component.html",
  styleUrls: ["./my-documents.component.css"],
  providers: [DocumentService],
})
export class MyDocumentsComponent implements OnInit {
  documents: Document[] = [];
  userId: string = "";
  loading: boolean = false; 
  error: string | null = null;
  userType: string = "";

  constructor(
    private auth: AuthService,
    private documentService: DocumentService,
    private cdr: ChangeDetectorRef,
    private store: Store,
    private toastr: ToastrService, // Inject ToastrService
    private route: ActivatedRoute
  ) {}

  ngOnInit() {
    // Check if user is logged in
    this.auth.isAuthenticated$.subscribe((isAuthenticated) => {
      if (isAuthenticated) {
        this.store.select(selectUserType).subscribe((type) => (this.userType = type));
        this.userId = this.route.snapshot.paramMap.get("receiverUserId");
        this.loadDocuments();
      }
    });
  }
  loadDocuments(){
    this.loading = true; // Start loading
    if (!this.userId) {
      this.store.select(getTokenFromSession).subscribe(token => {
        const decodedToken = jwtDecode(token);
        this.userId = decodedToken.sub.split("|")[1];

        this.documentService
        .getDocumentRequests()
        .subscribe({
          next: data => {
            this.documents = this.processDocuments(data);
            this.loading = false; 
            this.error = null; 
            this.cdr.detectChanges(); 
          },
          error: error => {
            console.error("Error fetching documents:", error);
            this.error = "Failed to load documents"; 
            this.loading = false; 
            this.cdr.detectChanges(); 
          }
        });
      })
    }
    else {
      this.documentService
        .getDocumentRequestsByUserIdForAdmin(this.userId)
        .subscribe({
          next: (data) => {
            this.documents = this.processDocuments(data);
            this.loading = false;
            this.error = null;
            this.cdr.detectChanges();
          },
          error: (error) => {
            console.error("Error fetching documents:", error);
            this.error = "Failed to load documents";
            this.loading = false;
            this.cdr.detectChanges();
          },
        });
    }
  }
  refreshDocuments(event: { selectedFile: any; selectedDocument: any }): void {
    const infoToast = this.toastr.info(
      `Uploading document for ${event.selectedDocument.type}`,
      'Uploading Document'
    );
    this.documentService
      .uploadDocument(
        event.selectedFile,
        event.selectedDocument,
      )
      .subscribe({
        next: () => {
          this.toastr.clear(infoToast.toastId);
          this.toastr.success('File uploaded successfully!', 'Success');
          event.selectedFile = {};
          event.selectedDocument = null;
          this.loadDocuments();  // Re-fetch the documents
        },
        error: (error) => {
          console.error('Error uploading file:', error);
          this.toastr.clear(infoToast.toastId);
          this.toastr.error(
            'Failed to upload document. Please try again.',
            'Upload Failed'
          );
        },
      });

  }
  processDocuments(response: any[]) {
    return response.reduce((acc, resItem) => {
      const request = resItem.requests;
      const activityData = resItem.activities;
      const documentsData = resItem.documents;
 
      const documents = documentsData.map((document, index: number) => {
        return {
          type: document.documentTypeName,
          documentTypeGuid: document.documentTypeGuid,
          documentRequestGuid: document.documentRequestGuid,
          documentRequestDocumentsGuid: document.documentRequestDocumentsGuid,
          documentUrl: document.blobStorageIdentifier,
          status: activityData[index]?.activityTypeValueCode,
          action: activityData[index]?.activityTypeHeaderCode,
          documentRequestActivityGuid: activityData[index]?.documentRequestActivityGuid,
          requestedDate:request?.created,
          uploadedDate: activityData[index]?.activityTypeHeaderCode === 'UPLOADED' ? activityData[index].activityDateTime : null,
          rejectionReason: document.rejectionReason,
          docShowMore: false
        };
      });
 
      return acc.concat(documents);  // Concatenate arrays to flatten
    }, []);
  }
  approveOrRejectDocument(event: { action: any; selectedDocument: any }): void {
    const infoToast = this.toastr.info(
      `${event.action} document for ${event.selectedDocument.type}`,
      event.action + ' Document'
    );
    if(event.action == 'download'){
      this.documentService.downladFileByDocId(event.selectedDocument.documentRequestDocumentsGuid)
      .subscribe({
        next: (response: any) => {
          const blob = new Blob([response.body], { type: 'application/octet-stream' });
          const url = window.URL.createObjectURL(blob);
  
          const contentDisposition = response.headers.get('Content-Disposition');
      
          let filename = 'downloaded_file';
          if (contentDisposition) {
            const match = contentDisposition.match(/filename="(.+)"/);
            if (match?.[1]) {
              filename = match[1];
            }
          }

          const a = document.createElement('a');
          a.href = url;
          a.download = filename;
          a.click();
  
          // Clean up resources
          window.URL.revokeObjectURL(url);
          event.selectedDocument = null;
          this.toastr.success('Document downloaded successfully');
        },
        error: (error) => {
          console.log('Error while downloading the file: ', error);
        }
      })
    }
    else{
      var docStatus: StatusUpdate = {
        approve: false,
        reject: false,
        reapply: false
      };
      event.action == 'approve' ? docStatus.approve = true : docStatus.reject = true;
  
      var documentRequestResponse = {
        documentRequestActivityGuid : event.selectedDocument.documentRequestActivityGuid,
        documentRequestDocumentsGuid : event.selectedDocument.documentRequestDocumentsGuid,
        documentRequestGuid : event.selectedDocument.documentRequestGuid,
        status: docStatus,
        rejectionReason: event.selectedDocument.rejectionReason
      }
      this.documentService.updateDocumentrequest(documentRequestResponse)
      .subscribe({
        next: () => {
          this.toastr.clear(infoToast.toastId);
          this.toastr.success('Document status updated successfully!', 'Success');
          event.selectedDocument = null;
          this.loadDocuments();  // Re-fetch the documents
        },
        error: (error) => {
          console.log('Error while updating the documentRequestStatus: ', error);
        }
      })
    }
  }
}
