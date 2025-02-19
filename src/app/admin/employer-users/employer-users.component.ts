import { Component, OnInit } from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';
import { AdminDashboardService } from '../../core/service/admin-dashboard.service';
import { CommonModule } from '@angular/common';
import { UserComponent } from '../user/user.component';
import { FormsModule } from '@angular/forms';
import { ToastrService } from 'ngx-toastr';
import { HttpClientModule } from '@angular/common/http';
import { Employer, UserDetails } from '../../../util/types';


@Component({
  selector: 'app-employer-users',
  standalone: true,
  imports: [CommonModule, FormsModule, UserComponent, HttpClientModule],
  templateUrl: './employer-users.component.html',
  styleUrl: './employer-users.component.css',
  providers: [AdminDashboardService]
})
export class EmployerUsersComponent implements OnInit {
  employer: Employer;
  users: UserDetails[];

  employerGuid: string;
  isEmployerEditing: boolean = false;

  constructor(
    private route: ActivatedRoute,
    private router: Router,
    private adminDashboardService: AdminDashboardService,
    private toastr: ToastrService
  ) {}

  ngOnInit(): void {
    this.employerGuid = this.route.snapshot.paramMap.get('id');
    this.isEmployerEditing = false;
    this.fetchEmployer();
  }

  fetchEmployer(): void {
    this.adminDashboardService
      .getEmployer(this.employerGuid)
      .subscribe({
        next: (data) => {
          this.employer = data.employerDetails;
          this.employer.signUpDate = new Date(
            data.employerDetails.signUpDate
          ).toDateString();
          this.employer.calendlyBookingLink =
            data.employerDetails.calendlyBookingLink ?? '';
          this.users = data.usersDetails;
        },
        error: (err) => console.error('Error fetching employer details', err),
      });
  }

  enableEditing(): void {
    this.isEmployerEditing = true;
  }

  updateEmployer(): void {
    var requestBody = {
      calendlyBookingLink: this.employer.calendlyBookingLink,
      schedulingFormId:this.employer.schedulingFormId
    };
    this.adminDashboardService
      .updateEmployer(this.employerGuid, requestBody)
      .subscribe({
        next: (_) => {
          this.toastr.success('Employer Successfully Updated', 'Success');
          this.isEmployerEditing = false;
          this.router.navigate([
            `/employer/${this.employer.employerGuid}/users`,
          ]);
        },
        error: (error) => {
          this.toastr.error('Employer is not updated', error);
          console.error('Error updating employer', error);
        },
      });
  }

  cancelEditing(): void {
    this.isEmployerEditing = false;
  }

  deleteEmployer(): void {
    var employerNameEntered = prompt("Do you really want to delete Employer?\nPlease enter Employer Name");
    if(employerNameEntered == null || employerNameEntered == "")
      return;
    if(employerNameEntered?.trim().localeCompare(this.employer.employerName)!==0){
      alert("Wrong Name entered");
      return;
    }
    this.adminDashboardService
      .deleteEmployer(this.employer.employerGuid)
      .subscribe({
        next: (_) => {
          this.toastr.success('Employer Successfully Deleted', 'Success');
          this.router.navigate([
            `/employer/${this.employer.employerGuid}/users`,
          ]);
        },
        error: (error) => {
          this.toastr.error('Employer is not deleted', error);
          console.error('Error deleting employer', error);
        },
      });
  }
}
