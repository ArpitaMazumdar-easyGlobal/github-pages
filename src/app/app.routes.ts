import { Routes } from '@angular/router';
import { HomeComponent } from './application/home/home.component';
import { MyApplicationComponent } from './application/my-application/my-application.component';
import { ApplicationFormComponent } from './application/application-form/application-form.component';
import {MyDocumentsComponent} from "./application/my-documents/my-documents.component";
import { LoginComponent } from './application/login/login.component';
import { authGuardFn } from '@auth0/auth0-angular';
import { WebformsComponent } from './application/webforms/webforms.component';
import { FormManagerComponent } from './application/form-manager/form-manager.component';
import { ProgressTrackerComponent } from './shared/progress-tracker/progress-tracker.component';
import { UploadDocumentComponent } from './application/upload-document/upload-document.component';
import { FilloutComponent } from './application/fillout/fillout.component';
import { FormAnswersComponent } from './application/form-answers/form-answers.component';
import { AdminDashboardComponent } from './admin/admin-dashboard/admin-dashboard.component';
import { EmployerUsersComponent } from './admin/employer-users/employer-users.component';
import { InsurerDashboardComponent } from './application/insurer-dashboard/insurer-dashboard.component';
import { ManageCandidatesComponent } from './application/manage-candidates/manage-candidates.component';
import { UpcomingInterviewComponent } from './application/upcoming-interview/upcoming-interview.component';
import { RoleGuard } from './core/guards/role.guard';
import { PageNotFoundComponent } from './shared/page-not-found/page-not-found.component';
import { EmployerComponent } from './admin/employer/employer.component';
import { ApplicationsComponent } from './admin/applications/applications.component';
import { ApplicantsComponent } from './admin/applicants/applicants.component';
import { ApplicantComponent } from './admin/applicant/applicant.component';
import { DocumentRequestComponent } from './admin/document-request/document-request.component';
import { ApplicationDetailComponent } from './admin/application-detail/application-detail.component';
import { WebformDocumentManagerComponent } from './admin/webform-document-manager/webform-document-manager.component';

export const routes: Routes = [
  { path:'login/:email', component:LoginComponent},
  { path:'login/:email/:application', component:LoginComponent},
  { path:'login', component:LoginComponent},
  { path: 'home', component: HomeComponent , canActivate: [authGuardFn]},
  { path: 'home/:application', component: HomeComponent , canActivate: [authGuardFn]},
  { path: 'myapplication', component: MyApplicationComponent, canActivate: [authGuardFn,RoleGuard], data:{roles:['APPLICANT']}},
  { path:'mydocuments', component:MyDocumentsComponent, canActivate:[authGuardFn]},
  { path:'mydocuments/:receiverUserId', component:MyDocumentsComponent, canActivate:[authGuardFn]},
  { path: 'progresstracker', component: ProgressTrackerComponent,canActivate: [authGuardFn]},
  { path: 'employerDashboard', component: InsurerDashboardComponent,canActivate: [authGuardFn, RoleGuard], data:{roles:['EMPLOYER']}},
  { path: 'employerDashboard/:empId', component: InsurerDashboardComponent,canActivate: [authGuardFn, RoleGuard], data:{roles:['ADMIN']}},
  { path: 'manageCandidates', component: ManageCandidatesComponent,canActivate: [authGuardFn, RoleGuard], data:{roles:['EMPLOYER']}},
  {
    path: 'form-manager/:id/:insId',
    component: FormManagerComponent,
    canActivate: [authGuardFn],
    children: [
      { path: 'forms', component: WebformsComponent },  // Child route for forms
      { path: 'applicationform', component: ApplicationFormComponent },  // Child route for application form
      { path: 'documentupload', component: UploadDocumentComponent },
      { path: 'filloutForm', component: FilloutComponent },
      { path: 'info', component: FilloutComponent },
      {path: 'form-answers/:webFormInstanceGuid', component:FormAnswersComponent}
    ]
  },
  { path: 'admin', component: AdminDashboardComponent, canActivate: [authGuardFn, RoleGuard], data:{roles:['ADMIN']}},
  { path: 'admin/employers', component: EmployerComponent, canActivate: [authGuardFn, RoleGuard], data:{roles:['ADMIN']}},
  { path: 'admin/applications', component: ApplicationsComponent, canActivate: [authGuardFn, RoleGuard], data:{roles:['ADMIN']}},
  { path: 'admin/applicants', component: ApplicantsComponent, canActivate: [authGuardFn, RoleGuard], data:{roles:['ADMIN']}},
  { path: 'admin/application/:appId', component: ApplicationDetailComponent, canActivate: [authGuardFn, RoleGuard], data:{roles:['ADMIN']}},
  { path: 'forms-documents', component: WebformDocumentManagerComponent, canActivate: [authGuardFn, RoleGuard], data:{roles:['ADMIN']}},
  { path: 'admin/applicant/:userGuid', component: ApplicantComponent, canActivate: [authGuardFn, RoleGuard], data:{roles:['ADMIN']}},
  { path: 'employer/:id/users', component: EmployerUsersComponent,canActivate: [authGuardFn, RoleGuard], data:{roles:['ADMIN']} },
  { path: 'upcomingInterviews', component: UpcomingInterviewComponent,canActivate: [authGuardFn, RoleGuard], data:{roles:['ADMIN','EMPLOYER']}},
  { path: 'documentRequest', component: DocumentRequestComponent,canActivate: [authGuardFn, RoleGuard], data:{roles:['ADMIN']} },
  { path: '', redirectTo: '/login', pathMatch: 'full' },  // Default Route
  { path: '**', component:PageNotFoundComponent},
  { path: '404', component:PageNotFoundComponent},
];
