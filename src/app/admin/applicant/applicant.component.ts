import { Component, OnInit } from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';
import { AdminDashboardService } from '../../core/service/admin-dashboard.service';
import { Applicant, ApplicationInstancesDetails } from '../../../util/types';
import { HttpClientModule } from '@angular/common/http';
import { CommonModule } from '@angular/common';
import { DialogModule } from 'primeng/dialog';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';
import { ButtonModule } from 'primeng/button';
import { InputTextModule } from 'primeng/inputtext';
import { ToastrService } from 'ngx-toastr';
import { TableModule } from 'primeng/table';
import { NgSelectModule } from '@ng-select/ng-select';
import { getAllCountriesName } from '../../../util/utility';

@Component({
  selector: 'app-applicant',
  standalone: true,
  imports: [
    HttpClientModule,
    CommonModule,
    DialogModule,
    FormsModule,
    ButtonModule,
    InputTextModule,
    ReactiveFormsModule,
    TableModule,
    NgSelectModule,
  ],
  providers: [AdminDashboardService],
  templateUrl: './applicant.component.html',
  styleUrl: './applicant.component.css',
})
export class ApplicantComponent implements OnInit {
  userDetails: Applicant;
  editUserDetails: Applicant = {
    userGuid: '',
    userEmail: '',
    firstName: '',
    lastName: '',
    mobileNumber: '',
    countryOfNationality: '',
  };
  applicationInstancesDetails: ApplicationInstancesDetails[] = [];
  userGuid: string;
  displayEditUserModal: boolean = false;
  listOfAllCountries: string[] = [];

  constructor(
    private route: ActivatedRoute,
    private adminDashboardService: AdminDashboardService,
    private toastr: ToastrService,
    private router: Router
  ) {}

  ngOnInit(): void {
    this.userGuid = this.route.snapshot.paramMap.get('userGuid');
    this.fetchUser();
  }

  fetchUser(): void {
    this.adminDashboardService.getUser(this.userGuid).subscribe({
      next: (data) => {
        this.userDetails = data.userDetail;
        this.applicationInstancesDetails = data.applicationInstancesDetails.map(
          (element) => ({
            applicationInstanceGuid: element.applicationInstanceGuid,
            applicationDetails: element.application,
          })
        );
      },
      error: (err) => console.error('Error fetching User details', err),
    });
  }

  updateUser(): void {
    this.adminDashboardService
      .updateUser(this.userDetails.userGuid, this.editUserDetails)
      .subscribe({
        next: (_) => {
          this.toastr.success('User is Successfully Updated', 'Success');
          this.displayEditUserModal = false;
          this.fetchUser();
        },
        error: (error) => {
          this.toastr.error('User is not updated', error);
          console.error('Error updating User', error);
        },
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

  openModalForEdit() {
    this.displayEditUserModal = true;
    this.editUserDetails = { ...this.userDetails };
    if(!this.listOfAllCountries.length)
      this.listOfAllCountries = getAllCountriesName();
  }

  onCountryChange(countryName: string) {
    this.editUserDetails.countryOfNationality = countryName;
  }

  closeModalForEdit() {
    this.displayEditUserModal = false;
  }

  deleteUser(): void {
    var userEmailEntered = prompt(
      'Do you really want to delete User?\nPlease enter User Email Id'
    );
    if (userEmailEntered == null || userEmailEntered == '') return;
    if (
      userEmailEntered?.trim().localeCompare(this.userDetails.userEmail) !== 0
    ) {
      alert('Wrong Email Id entered');
      return;
    }
    this.adminDashboardService.deleteUser(this.userGuid).subscribe({
      next: (_) => {
        this.toastr.success('User Successfully Deleted', 'Success');
        this.router.navigate(['/admin/applicants']);
      },
      error: (error) => {
        this.toastr.error('User is not deleted', error);
        console.error('Error deleting User', error);
      },
    });
  }
}
