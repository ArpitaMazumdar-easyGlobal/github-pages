import { CommonModule, Location } from '@angular/common';
import { Component, OnInit } from '@angular/core';
import { AdminDashboardService } from '../../core/service/admin-dashboard.service';
import { ActivatedRoute } from '@angular/router';
import { ToastrService } from 'ngx-toastr';
import { HttpClientModule } from '@angular/common/http';
import { ApplicationStep, DocumentType, WebForm } from '../../../util/types';
import { ProgressTrackerComponent } from '../../shared/progress-tracker/progress-tracker.component';
import { LoadingComponent } from '../../shared/loading/loading.component';
import { DialogModule } from 'primeng/dialog';
import { NgSelectModule } from '@ng-select/ng-select';
import { FormsModule } from '@angular/forms';
import { ButtonModule } from 'primeng/button';
import { TabViewModule } from 'primeng/tabview';

@Component({
  selector: 'app-application-detail',
  standalone: true,
  imports: [
    CommonModule,
    HttpClientModule,
    ProgressTrackerComponent,
    LoadingComponent,
    DialogModule,
    NgSelectModule,
    FormsModule,
    ButtonModule,
    TabViewModule,
  ],
  providers: [AdminDashboardService],
  templateUrl: './application-detail.component.html',
  styleUrl: './application-detail.component.css',
})
export class ApplicationDetailComponent {
  application: any = null;
  appGuid: string | null = null;
  loading: boolean = true;
  displayAddStepModal: boolean = false;
  displayDeleteDialog: boolean = false;
  isEditMode: boolean = false;
  displayWebFormDocumentModal: boolean = false;
  displayFormDocDeleteDialog: boolean = false;
  isAddWebForm: boolean = false;
  isRemoveWebForm: boolean = false;
  removeGuid:string = null;
  selectedWebFormGuid: string = null;
  selectedDocumentTypeGuid: string = null;
  selectedStep: any = null;
  selectedStepGuid: string = null;
  selectedStepWebForms: any[] = [];
  selectedStepDocuments: any[] = [];
  currentStep: ApplicationStep;
  webforms: WebForm[] = [];
  documents: DocumentType[] = [];
  stepValueCodes: string[] = ['INFORMATIONAL', 'WEBFORM', 'DOCUMENTCOLLECTION','WEBFORMANDDOCUMENT'];
  selectedValueCode: string = null;
  isDocumentRequired:boolean = false;
  
  constructor(
    private adminService: AdminDashboardService,
    private route: ActivatedRoute,
    private toast: ToastrService,
    private location: Location
  ) {}
  ngOnInit(): void {
    this.appGuid = this.route.snapshot.paramMap.get('appId');
    if (!this.appGuid) return;
    this.fetchApplicationData();
    this.fetchWebformsAndDocuments();
    this.currentStep = {
      applicationStepGuid: '',
      applicationStepName: '',
      applicationStepOrder: 0,
      applicationStepTypeValueCode: 'INFORMATIONAL',
      tenantGuid: 'B6FCC1F1-2F7F-4ADC-9C07-09D06651197D',
      applicationGuid: this.appGuid,
    };
  }
  onBack() {
    this.location.back();
  }
  openAddModal() {
    this.currentStep = {
      applicationStepGuid: '',
      applicationStepName: '',
      applicationStepOrder: 0,
      applicationStepTypeValueCode: 'INFORMATIONAL',
      tenantGuid: 'B6FCC1F1-2F7F-4ADC-9C07-09D06651197D',
      applicationGuid: this.appGuid,
    };
    this.displayAddStepModal = true;
  }
  closeAddModal() {
    this.displayAddStepModal = false;

    this.currentStep = {
      applicationStepGuid: null,
      applicationStepName: '',
      applicationStepOrder: 0,
      applicationStepTypeValueCode: 'INFORMATIONAL',
      tenantGuid: 'B6FCC1F1-2F7F-4ADC-9C07-09D06651197D',
      applicationGuid: this.appGuid,
    };
    this.isEditMode = false;
  }
  openModalForEdit(appStep: ApplicationStep) {
    this.isEditMode = true;
    this.currentStep = appStep;
    this.selectedValueCode = this.currentStep.applicationStepTypeValueCode;
    this.displayAddStepModal = true;
  }
  openDeleteModal(applicationStep: ApplicationStep) {
    this.displayDeleteDialog = true;
    this.currentStep = applicationStep;
  }
  closeDeleteDialog() {
    this.displayDeleteDialog = false;
    this.currentStep = null;
  }
  openWebFormDocumentModal(value: boolean) {
    this.isAddWebForm = value;
    this.displayWebFormDocumentModal = true;

  }
  closeWebFormDocumentsModal() {
    this.displayWebFormDocumentModal = false;
    this.isAddWebForm = false;
    this.selectedDocumentTypeGuid = null;
    this.selectedWebFormGuid = null;
  }

  openDeleteFormDocModal(value: boolean, guid:string) {
    this.isRemoveWebForm = value;
    this.removeGuid = guid;
    this.displayFormDocDeleteDialog = true;
  }
  closeFormDocDialog(){
    this.isRemoveWebForm = false;
    this.removeGuid = "";
    this.displayFormDocDeleteDialog = false;
  }
  onSelectedValueCodeChange(value) {
    this.selectedValueCode = value;
  }
  onSelectedStepGuidChange(stepGuid: string) {
    this.selectedStepGuid = stepGuid;
    const foundStep = this.application.applicationSteps.find(
      (ele) => ele.applicationStepGuid === this.selectedStepGuid
    );
    if (foundStep) {
      this.selectedStep = foundStep;
    }
    this.toast.success(`Step changed successfully ${stepGuid}`, 'success');
  }
  saveStep() {
    if (this.isEditMode) this.editStep();
    else this.addAppStep();
  }
  fetchApplicationData() {
    this.adminService.getApplicationDetails(this.appGuid).subscribe({
      next: (data) => {
        this.application = data;
        if (data?.applicationSteps?.length > 0 )
          this.onSelectedStepGuidChange(
            this.currentStep.applicationStepGuid || data.applicationSteps[0].applicationStepGuid
          );
        this.loading = false;
      },
      error: (error) => {
        this.toast.error('Error fetching application data', 'Error');
        this.loading = false;
      },
    });
  }
  fetchWebformsAndDocuments() {
    this.adminService.getAllWebForms().subscribe({
      next: (data) => {
        this.webforms = data;
      },
      error: (error) => {
        console.error('Error while fetching webforms: ', error);
      },
    });
    this.adminService.getAllDocumentType().subscribe({
      next: (data) => {
        this.documents = data;
      },
      error: (error) => {
        console.error('Error while fetching documents: ', error);
      },
    });
  }
  addAppStep() {
    this.currentStep.applicationStepTypeValueCode = this.selectedValueCode;
    this.adminService.createApplicationStep(this.currentStep).subscribe({
      next: (_) => {
        this.toast.success('Step Created Successfully', 'Success');
        this.fetchApplicationData();
        this.closeAddModal();
      },
      error: (error) => {
        this.toast.error('Error while creating the step', 'Error');
        console.error(error);
      },
    });
  }
  deleteStep() {
    if (!this.currentStep) return;
    this.adminService
      .deleteApplicationStep(this.currentStep.applicationStepGuid)
      .subscribe({
        next: (_) => {
          this.toast.success('Step deleted successfully', 'Success');
          this.fetchApplicationData();
          this.closeDeleteDialog();
        },
        error: (error) => {
          this.toast.error('Error deleting step', 'error');
          this.closeDeleteDialog();
          console.error('Error deleting step', error);
        },
      });
  }
  editStep() {
    if (!this.currentStep) return;
    this.currentStep.applicationStepTypeValueCode = this.selectedValueCode;
    this.adminService
      .updateApplicationStep(
        this.currentStep.applicationStepGuid,
        this.currentStep
      )
      .subscribe({
        next: (_) => {
          this.toast.success('Step updated successfully', 'Success');
          this.fetchApplicationData();
          this.closeDeleteDialog();
        },
        error: (error) => {
          this.toast.error('Error updating step', 'error');
          this.closeDeleteDialog();
          console.error('Error updating step', error);
        },
      });
  }
  addData() {
    if (this.isAddWebForm) this.addWebForm();
    else this.addDocument();
  }
  removeData(){
    if(this.isRemoveWebForm) this.deleteWebformFromStep();
    else this.deleteDocFromStep();
  }
  addWebForm() {
    if (!this.selectedStepGuid || !this.selectedWebFormGuid) return;
    this.adminService
      .addWebFormToStep({
        WebFormGuid: this.selectedWebFormGuid,
        ApplicationStepGuid: this.selectedStepGuid,
      })
      .subscribe({
        next: (data) => {
          this.fetchApplicationData();
          this.closeWebFormDocumentsModal();
          this.toast.success('WebForm added successfully', 'Success');
        },
        error: (error) => {
          this.toast.error('Error adding webform', 'Error');
          console.error('Error adding webform', error);
        },
      });
  }
  addDocument() {
    if (!this.selectedStepGuid || !this.selectedDocumentTypeGuid) return;
    if (
      this.selectedStep?.applicationStepTypeValueCode != 'DOCUMENTCOLLECTION' && this.selectedStep?.applicationStepTypeValueCode != 'WEBFORMANDDOCUMENT'
    ) {
      this.toast.error(
        'This step is not document collection. Can not add document to it' +
          this.selectedStep?.applicationStepTypeValueCode,
        'Error'
      );
      this.closeWebFormDocumentsModal();
      return;
    }
    console.log({
      DocumentTypeGuid: this.selectedDocumentTypeGuid,
      ApplicationStepGuid: this.selectedStepGuid,
      isRequired:this.isDocumentRequired
    });
    this.adminService
      .addDocumentToStep({
        DocumentTypeGuid: this.selectedDocumentTypeGuid,
        ApplicationStepGuid: this.selectedStepGuid,
        isRequired:this.isDocumentRequired
      })
      .subscribe({
        next: (data) => {
          this.fetchApplicationData();
          this.closeWebFormDocumentsModal();
          this.toast.success('Document added successfully', 'Success');
        },
        error: (error) => {
          this.toast.error('Error adding document', 'Error');
          console.error('Error adding document', error);
        },
      });
  }
  deleteWebformFromStep() {
    if (!this.removeGuid) return;
    this.adminService
      .deleteWebFormFromStep(this.removeGuid)
      .subscribe({
        next: (_) => {
          this.toast.success(' webform removed successfully', 'Success');
          this.fetchApplicationData();
          this.closeFormDocDialog();
        },
        error: (error) => {
          this.toast.error('Error removing webform', 'error');
          this.closeFormDocDialog();
          console.error('Error removing webform', error);
        },
      });
  }

  deleteDocFromStep() {
    if (!this.removeGuid) return;
    this.adminService
      .deleteDocumentTypeFromStep(this.removeGuid)
      .subscribe({
        next: (_) => {
          this.toast.success('Document removed successfully', 'Success');
          this.fetchApplicationData();
          this.closeFormDocDialog();
        },
        error: (error) => {
          this.toast.error('Error removing document', 'error');
          this.closeFormDocDialog();
          console.error('Error removing document', error);
        },
      });
  }
}
