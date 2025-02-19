import { ChangeDetectorRef, Component, EventEmitter, Input, OnChanges, OnInit, Output, SimpleChanges } from '@angular/core';
import { AuthService } from '@auth0/auth0-angular';
import { DocumentService } from '../../core/service/document.service';
import { DocumentListingComponent } from '../my-documents/document-listing/document-listing.component';
import { HttpClientModule } from '@angular/common/http';
import { CommonModule } from '@angular/common';
import { ToastrService } from 'ngx-toastr';
import { DataService } from '../../core/service/data.service';

@Component({
  selector: 'app-upload-document',
  standalone: true,
  imports: [DocumentListingComponent, HttpClientModule, CommonModule],
  templateUrl: './upload-document.component.html',
  styleUrl: './upload-document.component.css',
  providers: [DocumentService],
})
export class UploadDocumentComponent implements OnInit, OnChanges {

  userId: string = "";
  loading: boolean = false; 
  error: string | null = null;
  isDocumentsLoaded: boolean =  false;
  @Input() documentsInput: Document[] = [];
  @Input() applicationGuid: string;
  @Input() applicationInstanceStepGuid:string
  @Input() currentStepGuid:string;
  @Output() refreshFormManagerDataEmitter = new EventEmitter<any>();
  documents:Document[] =[];
  constructor(
    private auth: AuthService,
    private documentService: DocumentService,
    private cdr: ChangeDetectorRef,
    private toastr: ToastrService, // Inject ToastrService
    private dataService: DataService,

  ) {}
  ngOnChanges(changes: SimpleChanges): void {
    if (changes['documentsInput'] && changes['documentsInput'].currentValue) {
      if (this.documentsInput && this.documentsInput.length > 0) {
        this.documents = [...this.processDocuments(this.documentsInput)];
        this.isDocumentsLoaded = true;
        this.cdr.detectChanges();

      }
    }
  }
  
  ngOnInit() {
    // Check if user is logged in
    this.auth.isAuthenticated$.subscribe((isAuthenticated) => {
      if (isAuthenticated) {
        this.documents = [...this.processDocuments(this.documentsInput)];
        this.isDocumentsLoaded = true;
      }
    });
  }

  refreshDocuments(event: { selectedFile: any; selectedDocument: any }): void {
    const infoToast = this.toastr.info(
      `Uploading document for ${event.selectedDocument.type}`,
      'Uploading Document'
    );
    this.documentService
      .uploadApplicationDocument(
        event.selectedFile,
        event.selectedDocument,
      )
      .subscribe({
        next: () => {
          this.toastr.clear(infoToast.toastId);
          this.toastr.success('File uploaded successfully!', 'Success');
          event.selectedFile = {};
          event.selectedDocument = null;
          this.refreshFormManagerDataEmitter.emit();
          // here emit the event to fetch application step data too
          // this.loadDocuments(); 
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
  
  processDocuments(response: any) {
    console.log("document received for processing", response);
    const newDocuments = response.map(res => {
      return {
        type: res.applicationStep_documentName,
        documentTypeGuid: res.applicationStep_documentTypeGuid,
        applicationStepInstanceGuid: res.applicationInstanceStepGuid,
        documentUrl: res.url,
        status: this.returnStatus(res),
        action:null,
        requestedDate: res.created,
        uploadedDate: res.uploadedDateTime,
        rejectionReason:res.rejectionReason,
        applicationInstanceStepDocumentsGuid: res.applicationInstanceStepDocumentsGuid,
        documentGuid: res.documentGuid,
        isRequired : res.isRequired
      };
      
    });
    return newDocuments;
  }
  returnStatus(res: any){
    if(res.approvedDateTime) return 'APPROVED';
    else if(res.rejectedDateTime) return 'REJECTED';
    else if(res.uploadedDateTime) return 'PENDING';
    else return 'REQUESTED';
  }
  approveOrRejectDocument(event: { action: any; selectedDocument: any }): void {
    const infoToast = this.toastr.info(
      `${event.action} document for ${event.selectedDocument.type}`,
      event.action + ' Document'
    );
    
    if(event.action == 'approve'){
      this.documentService.approveApplicationInstanceStepDocument(event.selectedDocument.applicationInstanceStepDocumentsGuid)
      .subscribe({
        next: () => {
          this.toastr.clear(infoToast.toastId);
          this.toastr.success('Document status updated successfully!', 'Success');
          event.selectedDocument = null;
        },
        error: (error) => {
          console.log('Error while updating the documentRequestStatus: ', error);
        }
      })
    }
    if(event.action == 'reject'){
      this.documentService.rejectApplicationInstanceStepDocument(event.selectedDocument.applicationInstanceStepDocumentsGuid)
      .subscribe({
        next: () => {
          this.toastr.clear(infoToast.toastId);
          this.toastr.success('Document status updated successfully!', 'Success');
          event.selectedDocument = null;
        },
        error: (error) => {
          console.log('Error while updating the document status: ', error);
        }
      })
    }
    if(event.action == "download"){
      this.dataService.downladFile(event.selectedDocument.documentGuid)
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
          console.log('Error while downloading the document: ', error);
        }
      });
    }
  }
}
