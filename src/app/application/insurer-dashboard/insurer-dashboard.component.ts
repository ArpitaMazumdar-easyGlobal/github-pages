import { Component, OnInit } from '@angular/core';
import { Router, ActivatedRoute } from '@angular/router';
import { ApplicationInstance, EmployerUser, Invite, UserDetails } from '../../../util/types';
import { CommonModule } from '@angular/common';
import { AuthService } from '@auth0/auth0-angular';
import { HttpClientModule } from '@angular/common/http';
import { AdminDashboardService } from '../../core/service/admin-dashboard.service';
import { Store } from '@ngrx/store';
import { selectUserType } from '../../core/session/session.selectors';
import { Observable } from 'rxjs';
import { DialogModule } from 'primeng/dialog';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';
import { ToastrService } from 'ngx-toastr';
import { TableModule } from 'primeng/table';
import { DataService } from '../../core/service/data.service';
import { TabViewModule } from 'primeng/tabview';
import { NgSelectModule } from '@ng-select/ng-select';
import { ManageCandidatesComponent } from '../manage-candidates/manage-candidates.component';

@Component({
  selector: 'app-insurer-dashboard',
  standalone: true,
  imports: [
    CommonModule,
    HttpClientModule,
    DialogModule,
    FormsModule,
    ReactiveFormsModule,
    TableModule,
    TabViewModule,
    NgSelectModule,
    ManageCandidatesComponent
  ],
  providers: [DataService, AuthService, AdminDashboardService],
  templateUrl: './insurer-dashboard.component.html',
  styleUrl: './insurer-dashboard.component.css',
})
export class InsurerDashboardComponent implements OnInit {
  applicationInstances: ApplicationInstance[] = [];
  employerUsers: EmployerUser[] = [];
  inviteLists: Invite[] = [];
  userTypeFromSession: Observable<any>;
  userType: string;
  employerId: string | null = null;
  employerName:string | null = null;
  displayEditUserModal: boolean = false;
  currentUser: EmployerUser | null = null;
  currentInvite:Invite | null = null;
  displayDeleteDialog: boolean = false;
  displayInviteModal: boolean = false;
  displayRevokeModal:boolean = false;
  invite: Invite = {
    firstName: '',
    lastName: '',
    email: '',
    accessType: '',
    employerGuid:''
  };
  constructor(
    private authService: AuthService,
    private dataService: DataService,
    private router: Router,
    private route: ActivatedRoute,
    private adminDashboardService: AdminDashboardService,
    private store: Store,
    private toast: ToastrService
  ) {}

  ngOnInit(): void {
    this.userTypeFromSession = this.store.select(selectUserType);
    this.userTypeFromSession.subscribe((userType) => {
      this.userType = userType;
    });
    this.route.paramMap.subscribe((params) => {
      this.employerId = params.get('empId');
      this.fetchData();
    });
    this.route.queryParamMap.subscribe((queryParams) => {
      this.employerName = queryParams.get('employerName');
    });
  }
  private fetchData(){
    if (this.employerId) {
      this.fetchDataForEmpIdForAdmin(this.employerId);
    } else {
      this.fetchDataForLoggedInEmp();
    }
  }
  private fetchDataForEmpIdForAdmin(id: string): void {
    this.adminDashboardService.getEmployer(id).subscribe({
      next: (data) => {
        this.fetchApplicationInstanceDataAndFormatIt(data.applicationInstances);
        this.formatEmployerUserData(data);
        this.inviteLists = data.employerUserInvites;

      },
      error: (error) =>
        console.log('Error occurred while fetching instance by ID: ', error),
    });
  }

  private fetchDataForLoggedInEmp(): void {
    this.authService.isAuthenticated$.subscribe((isAuthenticated) => {
      if (isAuthenticated) {
        this.authService.user$.subscribe((user) => {
          this.dataService.getEmployerDashboardDataForEmployer().subscribe({
            next: (data) => {
              this.employerId = data.employerDetails.employerGuid;
              this.fetchApplicationInstanceDataAndFormatIt(
                data.applicationInstances
              );
              this.formatEmployerUserData(data);
              this.inviteLists = data.employerUserInvites;
              // if(this.applicationInstances.length == 1){
              //   // this.takeToApplicationDetailPage(this.applicationInstances[0].applicationGuid, this.applicationInstances[0].applicationInstanceGuid);
              // }
            },
            error: (error) =>
              console.log('Error occurred while fetching instances: ', error),
          });
        });
      }
    });
  }

  private takeToApplicationDetailPage(
    appGuid: string,
    appInstanceGuid: string
  ): void {
    this.router.navigate(['/form-manager', appGuid, appInstanceGuid], {
      queryParams: { showFullContent: true },
    });
  }

  private formatEmployerUserData(data){
    this.employerUsers = data.usersDetails;
    if(!data?.employerUsersDetails) return;
    this.employerUsers.forEach(element => {
      var res = data?.employerUsersDetails.find(ele => ele.userGuid === element.userGuid);
      if(res) {
        element.employerUserGuid = res.employerUserGuid;
        element.employerGuid = res.employerGuid
      }
    });
  }
  private fetchApplicationInstanceDataAndFormatIt(data): void {
    if (!data) return;
    this.applicationInstances = data.applications ?? data;
    this.applicationInstances.forEach((inst) => {
      inst.createdAtFormatted = this.formatDate(inst.createdAt);
    });
  }

  private formatDate(date: Date | number): string {
    const now = new Date();
    const createdAtDate = new Date(date);

    const diffTime = Math.abs(now.getTime() - createdAtDate.getTime());
    const diffDays = Math.floor(diffTime / (1000 * 60 * 60 * 24));

    if (diffDays === 0) {
      return 'Today';
    } else if (diffDays === 1) {
      return 'Yesterday';
    } else {
      return `${diffDays} day(s) ago`;
    }
  }
  updateUser() {
    if (this.currentUser) {
      this.adminDashboardService
        .updateEmployerUser(this.currentUser.employerUserGuid, this.currentUser)
        .subscribe({
          next: () => {
            // fetch data again
            this.fetchData();
            this.closeModal();
            this.toast.success('User updated successfully', 'Success');
          },
          error: (error) => {
            console.log('Error updating user:', error);
            this.toast.error('Error while  updating the user', 'Error');
          },
        });
    }
  }
  openModal(user: EmployerUser) {
    this.currentUser = user;
    this.displayEditUserModal = true;
  }
  closeModal() {
    this.currentUser = null;
    this.displayEditUserModal = false;
  }
  openDeleteDialog(user: EmployerUser) {
    this.displayDeleteDialog = true;
    this.currentUser = user;
  }
  closeDeleteDialog() {
    this.displayDeleteDialog = false;
    this.currentUser = null;
  }
  openInviteModal() {
    this.invite = {
      firstName: '',
      lastName: '',
      email: '',
      accessType: 'ADMIN',
      employerGuid:""
    };
    this.displayInviteModal = true;
  }
  closeInviteModal() {
    this.displayInviteModal = false;
    this.invite = {
      firstName: '',
      lastName: '',
      email: '',
      accessType: 'ADMIN',
      employerGuid: ''
    };
  }
  openRevokeModal(invite:Invite){
    this.currentInvite = invite;
    this.displayRevokeModal = true;
  }
  closeRevokeDialog(){
    this.currentInvite = null;
    this.displayRevokeModal = false;
  }
  deleteUser() {
    if (this.currentUser) {
      this.adminDashboardService
        .deleteEmployerUser(this.currentUser.employerUserGuid)
        .subscribe({
          next: () => {
            this.fetchData();
            this.toast.success('User Deleted Successfully', 'success');
            this.currentUser = null;
            this.closeDeleteDialog();
          },
          error: (error) => {
            this.toast.error('Error while deleting the user', 'Error');
            console.log('Error while deleting the user', error);
            this.currentUser = null;
            this.closeDeleteDialog();
          },
        });
    }
  }
  sendInvite() {
    this.invite.employerGuid = this.employerId;
    this.dataService.sendInvite(this.invite).subscribe({
      next: (_) => {
        this.toast.success('Inviter Sent Sucessfully', 'Success');
        this.closeInviteModal();
        this.fetchData();

      },
      error:(error) =>{
        this.toast.error("Error while sending invite please try after sometime", "Error");
        console.log(error);
      }
    });
  }
  revokeInvite(){
    if(!this.currentInvite) return ;
    this.dataService.revokeInvite(this.currentInvite.employerUserInviteGuid).subscribe({
      next:(_) =>{
        this.fetchData();
        this.toast.success(`Invite for ${this.currentInvite.email} revoked successfully`, 'success');
        this.closeRevokeDialog();
      },
      error:(error) =>{
        this.toast.error(`Error while revoking invite for ${this.currentInvite.email}. Please try after sometime`, "Error");
        console.log(error);
      }
    })
  }
}
