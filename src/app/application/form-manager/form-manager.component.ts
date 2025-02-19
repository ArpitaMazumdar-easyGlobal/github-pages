import {
  ChangeDetectorRef,
  Component,
  OnInit,
  SimpleChanges,
} from '@angular/core';
import {
  ActivatedRoute,
  NavigationEnd,
  Router,
  RouterOutlet,
} from '@angular/router';
import { ApplicationService } from '../../core/service/application.service';
import { CommonModule } from '@angular/common';
import { ProgressTrackerComponent } from '../../shared/progress-tracker/progress-tracker.component';
import { HttpClientModule } from '@angular/common/http';
import { UserInfoBarComponent } from '../../shared/user-info-bar/user-info-bar.component';
import { TabViewModule } from 'primeng/tabview';
import { WebformsComponent } from '../webforms/webforms.component';
import { UploadDocumentComponent } from '../upload-document/upload-document.component';
import { TabMenuModule } from 'primeng/tabmenu';
import { MenuItem } from 'primeng/api';
import { CompletedFormsComponent } from '../completed-forms/completed-forms.component';
import { combineLatest } from 'rxjs';
import { Application } from '../../../util/types';
import { DataService } from '../../core/service/data.service';
import { FilloutComponent } from '../fillout/fillout.component';
import { ToastrService } from 'ngx-toastr';
import { InfoMessageComponent } from '../../shared/info-message/info-message.component';

@Component({
  selector: 'app-form-manager',
  standalone: true,
  imports: [
    CommonModule,
    ProgressTrackerComponent,
    HttpClientModule,
    RouterOutlet,
    UserInfoBarComponent,
    TabViewModule,
    WebformsComponent,
    UploadDocumentComponent,
    TabMenuModule,
    CompletedFormsComponent,
    FilloutComponent,
    InfoMessageComponent
  ],
  templateUrl: './form-manager.component.html',
  styleUrls: ['./form-manager.component.css'],
  providers: [ApplicationService, DataService],
})
export class FormManagerComponent implements OnInit {
  applicationGuid: string;
  applicationInstanceGuid: string;
  application: Application;
  tabList: MenuItem[] | undefined;
  activeTabIndex: number = 0;
  loading: boolean = true;
  showFullContent: boolean | string = false;
  currentInstanceStepGuid: string = '';
  currentStepWebFormGuid: string = '';
  currentValueCodeType: string = '';
  currentStepGuid: string = '';
  webforms: any[] = [];
  webformsPending: any[] = [];
  webformsCompleted: any[] = [];
  documentCollection: any[] = [];
  isCurrentStepInformational: boolean | string = false;
  webFormInstanceGuid: string = '';
  filloutFormIdentifier: string = '';
  webformName: string = '';
  userType: string = "";

  constructor(
    private route: ActivatedRoute,
    private router: Router,
    private cdr: ChangeDetectorRef,
    private applicationService: ApplicationService,
    private dataService: DataService,
    private toast:ToastrService
  ) {}

  ngOnInit(): void {
    // Combine your route subscriptions
    combineLatest([this.route.queryParamMap, this.route.paramMap]).subscribe(
      ([queryParams, params]) => {
        // Reset data on navigation
        if (event instanceof NavigationEnd) {
          this.resetData();
        }
        this.updateShowFullContent(queryParams.get('showFullContent'));
        this.isCurrentStepInformational = queryParams.get(
          'isCurrentStepInformational'
        );
        if(queryParams.get('index')) this.activeTabIndex = Number(queryParams.get('index'));
        this.applicationGuid = params.get('id');
        this.applicationInstanceGuid = params.get('insId');

        // Load data
        this.loadApplicationData();
        this.loading = false;
        this.cdr.detectChanges();
      }
    );
  }

  ngOnChanges(changes: SimpleChanges): void {
    this.loadApplicationData();
    if (changes.showFullContent) {
      this.updateShowFullContent(changes.showFullContent.currentValue);
      this.cdr.detectChanges();
    }
  }

  private updateShowFullContent(value: any) {
    this.showFullContent = value === 'true';
  }
  private resetData(): void {
    this.webforms = [];
    this.webformsPending = [];
    this.webformsCompleted = [];
    this.documentCollection = [];
    this.currentInstanceStepGuid = '';
    this.currentValueCodeType = '';
    this.currentStepGuid = '';
    this.isCurrentStepInformational = false;
  }

  handleInformationalStep(): void {
    if (this.isCurrentStepInformational) {
      // For informational steps, prepare the necessary data for <app-fillout>
      if (!this.webforms.length) {
        console.warn('No webforms available for informational step.');
        return;
      }
      this.webFormInstanceGuid = null;
      this.filloutFormIdentifier = null;
      this.webformName = null;
      this.cdr.detectChanges();
      this.dataService
        .createWebFormInstance(
          this.currentStepWebFormGuid,
          {},
          this.currentInstanceStepGuid
        )
        .subscribe({
          next: (data) => {
            this.webFormInstanceGuid = data.webFormInstanceGuid;
            this.filloutFormIdentifier =
              this.webforms[0]?.applicationStep_webFormFilloutEmbedURL;
            this.webformName = this.webforms[0]?.applicationStep_webFormName;
            this.cdr.detectChanges();
          },
          error: (error) => {
            console.error('Error creating webform instance:', error);
          },
        });
    }
  }

  changeCurrentStepGuid(appStepGuid: string): void {
    if (this.currentStepGuid === appStepGuid) return;
    this.currentStepGuid = appStepGuid;
    // here change the current instancestep guid
    this.currentInstanceStepGuid = this.application.applicationSteps.find((d) => d.applicationStepGuid == this.currentStepGuid)?.applicationInstanceStepGuid;
    this.fetchWebformsAndDocumentCollection(appStepGuid, () => {
      const currentStep = this.application.applicationSteps.find(
        (step) => step.applicationStepGuid === appStepGuid
      );

      if (currentStep?.applicationStepTypeValueCode === 'INFORMATIONAL') {
        this.isCurrentStepInformational = true;
      } else {
        this.isCurrentStepInformational = false;
      }

      this.handleInformationalStep();
    });
    this.toast.success("Step Data Fetched Successfully", "Success");
  }

  handleTabChange(newTabIndex: number): void {
    this.activeTabIndex = newTabIndex;
    this.cdr.detectChanges();
  }

  fetchWebformsAndDocumentCollection(
    appStepGuid: string,
    callback: () => void
  ): void {
    if (!appStepGuid) {
      console.warn('No appStepGuid provided');
      return;
    }

    this.webFormInstanceGuid = null;
    this.filloutFormIdentifier = null;
    this.webformName = null;
    this.webforms = [];
    this.webformsCompleted = [];
    this.webformsPending = [];
    this.documentCollection = [];
    this.applicationService
      .fetchWebformAndDocumentCollectionForStep(
        this.applicationInstanceGuid,
        this.currentStepGuid
      )
      .subscribe({
        next: (data) => {
          this.webforms = data.applicationStep_webForm;
          const webformInstance = data.applicationInstanceStep_webFormInstance;
          const groupedDocs = data.applicationStep_documentCollection;
          this.currentStepWebFormGuid = this.webforms[0]?.webFormGuid;
          this.webforms.forEach((webform) => {
            const instance = webformInstance.find(
              (webIns) =>
                webIns.completedDateTime &&
                webIns.webformGuid == webform.webFormGuid
            );
            webform.completedDateTime = instance?.completedDateTime ?? null;
            webform.webformInstanceGuid = instance?.webformInstanceGuid ?? null;
            if (instance) {
              this.webformsCompleted.push(webform);
            } else {
              this.webformsPending.push(webform);
            }
          });

          groupedDocs.forEach((doc) => {
            doc.applicationInstanceStepGuid = data.applicationInstanceStepGuid;
            const docinstance =
              data.applicationInstanceStep_documentCollection.find(
                (innerdoc) =>
                  innerdoc.documenType.documentTypeGuid ===
                  doc.applicationStep_documentTypeGuid
              ) ?? {};
            doc.url = docinstance.url;
            doc.approvedDateTime = docinstance.approvedDateTime ?? null;
            doc.rejectedDateTime = docinstance.rejectedDateTime ?? null;
            doc.rejectionReason = docinstance.rejectionReason ?? null;
            doc.uploadedDateTime = docinstance.uploadedDateTime ?? null;
            doc.applicationInstanceStepDocumentsGuid = docinstance.applicationInstanceStepDocumentsGuid;
            doc.documentGuid = docinstance.documentGuid;
            doc.docShowMore = false;
          });
          this.documentCollection = [...groupedDocs];
          const ifAppInfoFormRedirect = localStorage.getItem('ifAppInfoFormRedirect');
          if(ifAppInfoFormRedirect === 'true') {
            localStorage.removeItem('ifAppInfoFormRedirect');
            this.handleTabChange(1);
          }
          else{
            if(this.activeTabIndex != 0){
              if(this.webformsPending.length == 0) this.handleTabChange(1);
              if(this.documentCollection.length == 0 ) this.handleTabChange(2);
              if(this.webformsPending.length == 0 && this.documentCollection.length == 0 ) this.handleTabChange(2);
            }
          }
          
          this.cdr.detectChanges();
          callback();
        },
        error: (error) => {
          console.log(
            'Error occurred while fetching webforms and document collection',
            error
          );
        },
      });
  }

  loadApplicationData(): void {
    this.applicationService
      .fetchStepswithInstances(this.applicationInstanceGuid)
      .subscribe({
        next: (data) => {
          this.userType = data.userTypeValueCode;
          this.application = data.application;
          const words = this.application?.headerBanner?.split(' ');
          this.application.userObjective = words?.pop();
          this.application.headerBanner = words?.join(' ');
          this.application.applicationSteps = data.application.applicationSteps;
          const instancesStep = data.applicationInstanceSteps;

          this.application.applicationSteps.forEach((step) => {
            step.applicationInstanceGuid = data.applicationInstanceGuid;
            const instance = instancesStep.find(
              (ins) => ins.applicationStepGuid === step.applicationStepGuid
            );
            if (!instance) return;
            step.instanceCreated =
              instance.created != null
                ? new Date(instance?.created).toLocaleDateString()
                : null;
            step.instanceCompleted =
              instance.completedDateTime !== null
                ? new Date(instance.completedDateTime).toLocaleDateString()
                : null;
            step.instanceRejected =
              instance.rejectedDateTime !== null
                ? new Date(instance.rejectedDateTime).toLocaleDateString()
                : null;
            step.applicationInstanceStepGuid =
              instance.applicationInstanceStepGuid;
          });
          const currentStep = this.application.applicationSteps.find(
            (step) =>
              step.instanceCreated &&
              !step.instanceCompleted &&
              !step.instanceRejected
          );
          if (currentStep) {
            this.currentInstanceStepGuid =
              currentStep.applicationInstanceStepGuid;
            this.currentStepGuid = currentStep.applicationStepGuid;

            if (
              currentStep &&
              currentStep?.applicationStepTypeValueCode === 'INFORMATIONAL'
            )
              this.isCurrentStepInformational = true;
          }
          this.fetchWebformsAndDocumentCollection(this.currentStepGuid, () => {
            const currentStep = this.application.applicationSteps.find(
              (step) => step.applicationStepGuid === this.currentStepGuid
            );

            if (currentStep?.applicationStepTypeValueCode === 'INFORMATIONAL') {
              this.isCurrentStepInformational = true;
            } else {
              this.isCurrentStepInformational = false;
            }
            this.handleInformationalStep();
            this.cdr.detectChanges();
          });
        },
        error: (error) => {
          console.error('Error fetching application steps:', error);
        },
      });
  }
  isAllStepsCompleted():boolean{
    return this.application.applicationSteps.every((step) => step.instanceCompleted);
  }
}
