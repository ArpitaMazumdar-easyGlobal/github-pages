import { CommonModule } from '@angular/common';
import { Component, OnInit } from '@angular/core';
import { DialogModule } from 'primeng/dialog';
import { TabViewModule } from 'primeng/tabview';
import { WebForm } from '../../../util/types';
import { AdminDashboardService } from '../../core/service/admin-dashboard.service';
import { HttpClientModule } from '@angular/common/http';
import { PaginatorModule } from 'primeng/paginator';
import { FormsModule } from '@angular/forms';
import { ToastrService } from 'ngx-toastr';

@Component({
  selector: 'app-webform-document-manager',
  standalone: true,
  imports: [
    CommonModule,
    TabViewModule,
    DialogModule,
    HttpClientModule,
    PaginatorModule,
    FormsModule
  ],
  providers: [AdminDashboardService,ToastrService],
  templateUrl: './webform-doc-manager.component.html',
  styleUrl: './webform-doc-manager.component.css',
})
export class WebformDocumentManagerComponent implements OnInit {
  webforms: WebForm[] = [];
  documents: Document[] = [];
  displayWebFormDocumentModal: boolean = false;
  isAddWebForm: boolean = false;
  isRemoveWebForm: boolean = false;
  displayFormDocDeleteDialog: boolean = false;
  loading: boolean = true;
  currentWebForm:any = null;
  currentDocument: any = null;
  removeGuid:string = '';
  // Pagination properties for WebForms
  firstWebForm: number = 0;
  rowsWebForm: number = 10;
  totalWebForms: number = 0;

  // Pagination properties for Documents
  firstDocument: number = 0;
  rowsDocument: number = 10;
  totalDocuments: number = 0;
  ngOnInit(): void {
    this.fetchWebformsAndDocuments();
  }
  constructor(private adminService: AdminDashboardService, private toast:ToastrService) {}
  fetchWebformsAndDocuments() {
    this.adminService.getAllWebForms().subscribe({
      next: (data) => {
        this.webforms = data;
        this.totalWebForms = this.webforms.length;
      },
      error: (error) => {
        console.error('Error while fetching webforms: ', error);
      },
    });
    this.adminService.getAllDocumentType().subscribe({
      next: (data) => {
        this.documents = data;
        this.totalDocuments = this.documents.length;
      },
      error: (error) => {
        console.error('Error while fetching documents: ', error);
      },
    });
  }
  onBack() {}
  openWebFormDocumentModal(value: boolean) {
    this.isAddWebForm = value;
    // here set the values for the currentWebForm and currentDocument 
    this.currentWebForm =  {webFormName:"",  filloutFormIdentifier:""};
    this.currentDocument =  {documentTypeName:"",  documentTypeDescription:""}
    this.displayWebFormDocumentModal = true;
  }
  openDeleteFormDocModal(value:boolean, guid:string){
    this.isRemoveWebForm = value;
    this.removeGuid = guid;
    this.displayFormDocDeleteDialog = true;
  }
  closeWebFormDocumentsModal() {
    this.isAddWebForm = false;
    this.displayWebFormDocumentModal = false;
  }
  addData() {
    if(this.isAddWebForm) this.addWebForm();
    else this.addDocumentType();
  }
  removeData() {
    if(this.isRemoveWebForm) this.removeWebForm();
    else this.removeDocumentType();
  }
  closeFormDocDialog() {
    this.displayFormDocDeleteDialog = false;
  }
  addWebForm(){
    if(!this.currentWebForm) return;
    this.adminService.createWebForm(this.currentWebForm).subscribe({
      next:(_) =>{
        this.toast.success("WebForm Created SuccessFully", "Success");
        this.closeWebFormDocumentsModal();
        this.fetchWebformsAndDocuments();
      },
      error:(error) =>{
        this.toast.error("Error creating webform", "Error");
        this.closeWebFormDocumentsModal();
        console.error("Error creating webform", error);
      }
    });
  }
  addDocumentType(){
    if(!this.currentDocument) return;
    this.adminService.createDocumentType(this.currentDocument).subscribe({
      next:(_) =>{
        this.toast.success("DocumentType Created SuccessFully", "Success");
        this.closeWebFormDocumentsModal();
        this.fetchWebformsAndDocuments();
      },
      error:(error) =>{
        this.toast.error("Error creating DocumentType", "Error");
        this.closeWebFormDocumentsModal();
        console.error("Error creating DocumentType", error);
      }
    });
  }
  removeWebForm(){
    if(!this.removeGuid) return;
    this.adminService.deleteWebForm(this.removeGuid).subscribe({
      next:(_) =>{
        this.toast.success("Successfully deleted webform", "Success");
        this.closeFormDocDialog();
        this.fetchWebformsAndDocuments();
      },
      error:(error)=>{
        this.toast.error("Error while deleting webform", "Error");
        this.closeFormDocDialog();
        console.error("Error while deleting webform", error);
      }
    })
  }
  removeDocumentType(){
    if(!this.removeGuid) return;
    this.adminService.deleteDocumentType(this.removeGuid).subscribe({
      next:(_) =>{
        this.toast.success("Successfully deleted documentType", "Success");
        this.closeFormDocDialog();
        this.fetchWebformsAndDocuments();
      },
      error:(error)=>{
        this.toast.error("Error while deleting documentType", "Error");
        this.closeFormDocDialog();
        console.error("Error while deleting document Type", error);
      }
    })
  }
  
  // pagination functions
  get paginatedWebForms(): any[] {
    return this.webforms.slice(
      this.firstWebForm,
      this.firstWebForm + this.rowsWebForm
    );
  }
  get paginatedDocuments(): any[] {
    return this.documents.slice(
      this.firstDocument,
      this.firstDocument + this.rowsDocument
    );
  }
  onWebFormPageChange(event: any) {
    this.firstWebForm = event.first;
    this.rowsWebForm = event.rows;
  }

  onDocumentPageChange(event: any) {
    this.firstDocument = event.first;
    this.rowsDocument = event.rows;
  }
}
