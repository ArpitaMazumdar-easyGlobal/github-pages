import { Component, OnInit } from '@angular/core';
import { AdminDashboardService } from '../../core/service/admin-dashboard.service';
import {
  Applicant,
  RequestBodyForDocumentRequest,
  GetAllDocumentRequestResponse,
  DocumentRequestTable,
} from '../../../util/types';
import { CommonModule } from '@angular/common';
import { HttpClientModule } from '@angular/common/http';
import { TableModule } from 'primeng/table';
import { MultiSelectModule } from 'primeng/multiselect';
import { InputTextModule } from 'primeng/inputtext';
import { DropdownModule } from 'primeng/dropdown';
import { ButtonModule } from 'primeng/button';
import { DialogModule } from 'primeng/dialog';
import { FormsModule } from '@angular/forms';
import { NgSelectModule } from '@ng-select/ng-select';
import { environment } from '../../../environments/environment';
import { ToastrService } from 'ngx-toastr';
import { RouterLink } from '@angular/router';

@Component({
  selector: 'app-document-request',
  standalone: true,
  imports: [
    CommonModule,
    HttpClientModule,
    TableModule,
    MultiSelectModule,
    InputTextModule,
    DropdownModule,
    ButtonModule,
    DialogModule,
    FormsModule,
    NgSelectModule,
    RouterLink,
  ],
  providers: [AdminDashboardService],
  templateUrl: './document-request.component.html',
  styleUrl: './document-request.component.css',
})
export class DocumentRequestComponent implements OnInit {
  allDocumentRequest: DocumentRequestTable[] = [];
  allApplicants: Applicant[] = [];
  allDocumentType: DocumentType[] = [];
  displayAddDocumentRequestModal: boolean = false;
  selectedApplicantGuid: string = '';
  selectedDocumentTypes: DocumentType[] = [];
  adminUser: Applicant;

  constructor(
    private adminDashboardService: AdminDashboardService,
    private toast: ToastrService
  ) {}

  ngOnInit(): void {
    this.fetchAllDocumentRequest();
  }

  fetchAllDocumentRequest() {
    this.adminDashboardService.getAllDocumentRequest().subscribe({
      next: (data: GetAllDocumentRequestResponse[]) => {
        this.allDocumentRequest = this.generateResponseForTable(data);
      },
      error: (error) => {
        this.toast.error(
          'Error occured while fetching All Document Request',
          'Error'
        );
        console.log(
          'Error occured while fetching All Document Request:',
          error
        );
      },
    });
  }

  generateResponseForTable(
    input: GetAllDocumentRequestResponse[]
  ): DocumentRequestTable[] {
    const response: DocumentRequestTable[] = [];
    input.forEach((reqObj) => {
      const { requests } = reqObj;

      response.push({
        documentRequestGuid: requests.documentRequestGuid,
        receiverFirstName: requests.receiverFirstName,
        receiverLastName: requests.receiverLastName,
        receiverEmail: requests.receiverEmail,
        receiverPhone: requests.receiverPhone,
        created: new Date(requests.created).toDateString(),
        receiverFullName: `${requests.receiverFirstName} ${
          requests.receiverLastName === ''
            ? requests.receiverFirstName
            : requests.receiverLastName
        }`,
        receiverUserId: requests.receiverUserId,
      });
    });
    return response;
  }

  fetchAllApplicants() {
    this.adminDashboardService.getAllApplicants().subscribe({
      next: (data: Applicant[]) => {
        if (data && data.length) {
          this.allApplicants = data.map((applicant) => ({
            ...applicant,
            fullName: `${applicant.firstName} ${applicant.lastName} (${applicant.userEmail})`,
          }));
        } else {
          this.allApplicants = [];
        }
      },
      error: (error) => {
        this.toast.error(
          'Error occured while fetching All Applicants',
          'Error'
        );
        console.log('Error occured while fetching All Applicants:', error);
      },
    });
  }

  fetchAllDocumentType() {
    this.adminDashboardService.getAllDocumentType().subscribe({
      next: (data: DocumentType[]) => {
        if (data && data.length) {
          this.allDocumentType = data;
        } else {
          this.allDocumentType = [];
        }
      },
      error: (error) => {
        this.toast.error(
          'Error occured while fetching All Document Type',
          'Error'
        );
        console.log('Error occured while fetching All Document Type:', error);
      },
    });
  }

  fetchAdminUserInfo() {
    this.adminDashboardService.getUserInfo().subscribe({
      next: (data) => (this.adminUser = data),
      error: (error) => {
        this.toast.error(
          'Error occured while fetching Admin User Information',
          'Error'
        );
        console.log(
          'Error occured while fetching Admin User Information:',
          error
        );
      },
    });
  }

  openModal() {
    this.displayAddDocumentRequestModal = true;
    if (this.allApplicants.length != 0 && this.allDocumentType.length != 0) {
      return;
    }
    this.fetchAllApplicants();
    this.fetchAllDocumentType();
    this.fetchAdminUserInfo();
  }

  closeModal() {
    this.displayAddDocumentRequestModal = false;
    this.selectedApplicantGuid = '';
    this.selectedDocumentTypes = [];
  }

  CreateDocumentRequest() {
    const applicantSelected = this.allApplicants.find(
      (item) => item.userGuid === this.selectedApplicantGuid
    );

    const reqBody: RequestBodyForDocumentRequest = {
      RequestToken: [...Array(20)]
        .map(() => Math.random().toString(36)[2])
        .join(''),
      ReceiverFirstName: applicantSelected.firstName,
      ReceiverLastName: applicantSelected.lastName,
      ReceiverEmail: applicantSelected.userEmail,
      ReceiverPhone: applicantSelected.mobileNumber,
      RequestLink: `${environment.baseUrl}/login`,
      DocumentTypes: this.selectedDocumentTypes.map((doc: any) => ({
        documentTypeGuid: doc.documentTypeGuid,
      })),
      SenderFirstName: this.adminUser.firstName,
      SenderLastName:
        this.adminUser.lastName === ''
          ? this.adminUser.firstName
          : this.adminUser.lastName,
      SenderEmail: this.adminUser.userEmail,
    };

    this.adminDashboardService.createDocumentRequest(reqBody).subscribe({
      next: (data) => {
        this.toast.success(
          'Document Request is successfully created',
          'Success'
        );
        console.log('DATA:', data);
        this.closeModal();
        this.fetchAllDocumentRequest();
      },
      error: (error) => {
        this.toast.error(
          'Error occured while creating Document Request',
          'Error'
        );
        console.log('Error occured while creating Document Request:', error);
      },
    });
  }
}
