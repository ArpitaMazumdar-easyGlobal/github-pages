import { CommonModule } from '@angular/common';
import {
  Component,
  Input,
  OnInit,
  Output,
  EventEmitter,
  ChangeDetectorRef,
  ViewChild,
} from '@angular/core';
import { DialogModule } from 'primeng/dialog';
import { FileUpload, FileUploadModule } from 'primeng/fileupload';
import { TagModule } from 'primeng/tag';
import { ButtonModule } from 'primeng/button';
import { ToastrService } from 'ngx-toastr';
import { TabViewModule } from 'primeng/tabview';
import { formatDate } from '../../../../util/utility';
import { HttpClientModule } from '@angular/common/http';
import { SimpleChanges } from '@angular/core';
import { TooltipModule } from 'primeng/tooltip';
import { Store } from '@ngrx/store';
import { selectUserType } from '../../../core/session/session.selectors';
import { Observable } from 'rxjs';
interface Tabs {
  title: string;
  documents: any[];
}
@Component({
  selector: 'app-document-listing',
  standalone: true,
  imports: [
    CommonModule,
    TagModule,
    ButtonModule,
    DialogModule,
    FileUploadModule,
    TabViewModule,
    HttpClientModule,
    TooltipModule,
  ],
  templateUrl: './doc-listing.component.html',
  styleUrl: './doc-listing.component.css',
})
export class DocumentListingComponent implements OnInit {
  @Input() documents: any[] = [];
  @Input() isMyDocuments: boolean = false;
  @Input() userId: string;
  @Output() documentUploaded = new EventEmitter<{
    selectedFile: any;
    selectedDocument: any;
  }>();
  @Output() approveOrRejectDocument = new EventEmitter<{ action: any; selectedDocument: any }>();
  userTypeFromSession: Observable<any>;
  userType: string;
  displayDialog = false;
  actionToConfirm: string;
  currentDoc:any|null = null;
  @ViewChild('fileUpload') fileUpload!: FileUpload;

  constructor(
    private toastr: ToastrService, 
    private cdr: ChangeDetectorRef,
    private store: Store,
  ) {}
  ngOnInit(): void {
    this.userTypeFromSession = this.store.select(selectUserType);
        this.userTypeFromSession.subscribe((userType) => {
          this.userType = userType;
    });
    if (this.documents && this.documents.length > 0) {
      this.groupRelatedActionDocuments(this.documents);
    }
  }

  ngOnChanges(changes: SimpleChanges): void {
    if (changes['documents'] && changes['documents'].currentValue) {
      // Ensure we have valid data
      if (this.documents && Array.isArray(this.documents)) {
        this.groupRelatedActionDocuments(this.documents);
        this.cdr.detectChanges();
      }
    }
  }
  uploadDialogVisible = false;
  selectedDocument: any = null;
  selectedFile: any = {};
  tabs: Tabs[] = [
    { title: 'Pending Documents', documents: [] },
    { title: 'Awaiting Confirmation', documents: [] },
    { title: 'Completed Documents', documents: [] },
  ];

  openUploadDialog(doc: any) {
    this.fileUpload.clear();
    this.selectedDocument = doc;
    this.uploadDialogVisible = true;
  }
  getSeverity(status: string) {
    switch (status) {
      case 'APPROVED':
        return 'status-completed';
      case 'PENDING':
        return 'status-pending';
      case 'REQUESTED':
        return 'status-requested';
      case 'REJECTED':
        return 'status-rejected';
    }
  }
  choose(event, callback) {
    callback();
  }

  onRemoveTemplatingFile(event, file, removeFileCallback, index) {
    removeFileCallback(event, index);
    this.clearFile();
  }

  groupRelatedActionDocuments(documents: any[]) {
    documents.forEach((doc) => {
      doc.requestedDate = formatDate(doc.requestedDate);
      if (doc.uploadedDate) doc.uploadedDate = formatDate(doc.uploadedDate);
    });
    this.tabs[0].documents = documents.filter(
      (doc) => doc.status === 'REQUESTED' || doc.status === 'REJECTED'
    );
    this.tabs[1].documents = documents.filter(
      (doc) => doc.status === 'PENDING'
    );
    this.tabs[2].documents = documents.filter(
      (doc) => doc.status === 'APPROVED'
    );
  }

  selectFile(event: any): void {
    if (event.currentFiles && event.currentFiles.length > 0) {
      this.selectedFile.file = event.currentFiles;
      this.selectedFile.documentTypeGuid =
        this.selectedDocument?.documentTypeGuid;
    }
    for (const file of event.files) {
      const reader = new FileReader();
      reader.onload = () => {
        file.previewUrl = reader.result;
      };
      if (file.type.startsWith('image/')) {
        reader.readAsDataURL(file);
      }
    }
  }

  isImage(file: any): boolean {
    return file.type.startsWith('image/');
  }

  getFileIcon(file: any): string {
    const fileType = file.type;
    if (fileType.includes('pdf')) return 'pi pi-file-pdf text-danger';
    if (fileType.includes('word')) return 'pi pi-file-word text-primary';
    if (fileType.includes('excel')) return 'pi pi-file-excel text-success';
    if (fileType.includes('text')) return 'pi pi-file text-secondary';
    return 'pi pi-file';
  }

  cancelUpload() {
    this.uploadDialogVisible = false;
    this.clearFile();
    this.fileUpload.clear();
  }

  clearFile(): void {
    this.selectedFile = {};
  }

  uploadDocument(): void {
    if (
      !this.selectedFile.file ||
      this.selectedFile.documentTypeGuid !==
        this.selectedDocument?.documentTypeGuid
    ) {
      this.toastr.warning(
        'Please select a file to upload.',
        'File Selection Required'
      );
      return;
    }
    this.documentUploaded.emit({
      selectedFile: this.selectedFile.file[0],
      selectedDocument: this.selectedDocument,
    }); // to re-fetch the documents to show updates after upload
    this.uploadDialogVisible = false;
  }

  toggleMoreMenu(doc: any){
    doc.docShowMore = !doc.docShowMore;
  }

  openDialog(action: string, doc:any): void {
    this.actionToConfirm = action;
    this.currentDoc = doc;
    this.displayDialog = true;
  }

  closeDialog(): void {
    this.displayDialog = false;
  }

  confirmAction(): void {
    this.approveOrRejectDocument.emit({action: this.actionToConfirm, selectedDocument: this.currentDoc});
    this.closeDialog();
  }
}
