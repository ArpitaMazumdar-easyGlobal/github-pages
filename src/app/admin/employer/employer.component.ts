import { CommonModule } from '@angular/common';
import { Component, OnInit } from '@angular/core';
import { RouterLink } from '@angular/router';
import {
  Employer,
  Invite,
  
} from '../../../util/types';
import {
  AdminDashboardService,
  UpdateEmployer,
} from '../../core/service/admin-dashboard.service';
import { HttpClientModule } from '@angular/common/http';
import { DialogModule } from 'primeng/dialog';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';
import { ToastrService } from 'ngx-toastr';
import { MultiSelectModule } from 'primeng/multiselect';
import { InputTextModule } from 'primeng/inputtext';
import { DropdownModule } from 'primeng/dropdown';
import { SliderModule } from 'primeng/slider';
import { ProgressBarModule } from 'primeng/progressbar';
import { TableModule } from 'primeng/table';
import { TagModule } from 'primeng/tag';
import { ButtonModule } from 'primeng/button';
import { NgSelectComponent, NgSelectModule } from '@ng-select/ng-select';

@Component({
  selector: 'app-employer',
  standalone: true,
  imports: [
    CommonModule,
    HttpClientModule,
    RouterLink,
    DialogModule,
    FormsModule,
    ReactiveFormsModule,
    MultiSelectModule,
    InputTextModule,
    DropdownModule,
    SliderModule,
    ProgressBarModule,
    TableModule,
    TagModule,
    ButtonModule,
    NgSelectModule
  ],
  providers: [AdminDashboardService],
  templateUrl: './employer.component.html',
  styleUrl: './employer.component.css',
  
})
export class EmployerComponent implements OnInit {
  // @Input() employers: Employer[] = [];
  employers: Employer[] = [];
  employerInvite:Invite | null = null;
  displayEditEmployerModal: boolean = false;
  currentEmployer: Employer | null = null;
  displayDeleteDialog: boolean = false;
  displayInviteDialog:boolean = false;

  constructor(
    private adminDashboardService: AdminDashboardService,
    private toast: ToastrService
  ) {}
  ngOnInit(): void {
    this.fetchEmployersData();
  }
  openEditDialog(employer: Employer): void {
    this.currentEmployer = { ...employer };
    this.displayEditEmployerModal = true;
  }
  updateEmployer(): void {
    if (this.currentEmployer) {
      const reqbody: UpdateEmployer = {
        calendlyBookingLink: this.currentEmployer.calendlyBookingLink,
        schedulingFormId:this.currentEmployer.schedulingFormId
      };
      this.adminDashboardService
        .updateEmployer(this.currentEmployer.employerGuid, reqbody)
        .subscribe({
          next: () => {
            // fetch data again
            this.fetchEmployersData();
            this.closeModal();
            this.toast.success('Employer updated successfully', 'Success');
          },
          error: (error) => {
            console.log('Error updating employer:', error);
            this.toast.error('Error while  updating the employer', 'Error');
          },
        });
    }
  }

  closeModal(): void {
    this.displayEditEmployerModal = false;
    this.currentEmployer = null;
  }
  openDeleteDialog(employer: Employer) {
    this.displayDeleteDialog = true;
    this.currentEmployer = employer;
  }
  closeDeleteDialog() {
    this.displayDeleteDialog = false;
    this.currentEmployer = null;
  }
  deleteEmployer() {
    if (this.currentEmployer) {
      this.adminDashboardService
        .deleteEmployer(this.currentEmployer.employerGuid)
        .subscribe({
          next: () => {
            this.fetchEmployersData();
            this.toast.success('Employer Deleted Successfully', 'success');
            this.currentEmployer = null;
            this.closeDeleteDialog();
          },
          error: (error) => {
            this.toast.error('Error while deleting the employer', 'Error');
            console.log('Error while deleting the employer', error);
            this.currentEmployer = null;
            this.closeDeleteDialog();
          },
        });
    }
  }
  fetchEmployersData() {
    this.employers = [];
    this.adminDashboardService.getAllEmployers().subscribe({
      next: (data) => {
        data.forEach((item) => {
          item.employerDetails.signUpDate = new Date(
            item.employerDetails.signUpDate
          ).toDateString();
          item.employerDetails.activeUsers = item.usersDetails.length;
          this.employers.push(item.employerDetails);
        });
      },
      error: (error) => {
        console.log('Error occured while fetching All Employers:', error);
      },
    });
  }
  openInviteModal(){
    this.displayInviteDialog = true;
    this.employerInvite = {
      employerName:"",
      firstName:"",
      lastName:"",
      email:"",
      accessType:"ADMIN"
    }
  }
  closeInviteModal(){
    this.displayInviteDialog = false;
    this.employerInvite = null;
  }
  sendEmployerInvite(){
    this.adminDashboardService.sendEmployerInnvite(this.employerInvite).subscribe({
      next:(_) => {
        this.fetchEmployersData();
        this.toast.success(`Invite Sent Successfully to ${this.employerInvite.email}`,"Success");
        this.closeInviteModal();
      },
      error:(error) =>{
        this.toast.error("Error while sending invite. Please try again after sometime", "Error");
        console.log(error);
        this.closeInviteModal();
      }
    })
  }
}
