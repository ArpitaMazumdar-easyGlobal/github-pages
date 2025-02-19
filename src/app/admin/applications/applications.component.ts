import { Component, OnInit } from '@angular/core';
import { AdminDashboardService } from '../../core/service/admin-dashboard.service';
import { Application, NewApplication } from '../../../util/types';
import { CommonModule } from '@angular/common';
import { AvatarModule } from 'primeng/avatar';
import { HttpClientModule } from '@angular/common/http';
import { MultiSelectModule } from 'primeng/multiselect';
import { InputTextModule } from 'primeng/inputtext';
import { DropdownModule } from 'primeng/dropdown';
import { SliderModule } from 'primeng/slider';
import { ProgressBarModule } from 'primeng/progressbar';
import { TableModule } from 'primeng/table';
import { TagModule } from 'primeng/tag';
import { ButtonModule } from 'primeng/button';
import { DialogModule } from 'primeng/dialog';
import { FormsModule } from '@angular/forms';
import { ToastrService } from 'ngx-toastr';
import { NgSelectModule } from '@ng-select/ng-select';
import { countriesWithCodes } from '../../../util/countries';
import { RouterLink } from '@angular/router';

@Component({
  selector: 'app-applications',
  standalone: true,
  imports: [
    CommonModule,
    AvatarModule,
    HttpClientModule,
    MultiSelectModule,
    InputTextModule,
    DropdownModule,
    SliderModule,
    ProgressBarModule,
    TableModule,
    TagModule,
    ButtonModule,
    DialogModule,
    FormsModule,
    NgSelectModule,
    RouterLink
  ],
  providers: [AdminDashboardService],
  templateUrl: './applications.component.html',
  styleUrl: './applications.component.css',
})
export class ApplicationsComponent implements OnInit {
  applications: Application[] = [];
  displayAddAppModal:boolean = false;
  isEditMode:boolean = false;
  displayDeleteDialog:boolean = false;
  currentApplication:NewApplication = {
    applicationName :"",
    applicationCountry: "",
    applicationDescription:"",
    headerBanner:"",
    destinationCountry:"",
    tenantGuid:""
  }
  countries = countriesWithCodes;

  constructor(private adminDashboardService: AdminDashboardService, private toast:ToastrService) {}

  ngOnInit(): void {
    this.fetchApplications();
  }

  openModalForAdd(){
    this.isEditMode = false;
    this.currentApplication = {
      applicationName :"",
      applicationCountry: "",
      applicationDescription:"",
      headerBanner:"",
      destinationCountry:"",
      tenantGuid:""
    }
    this.displayAddAppModal = true;
  }
  openModalForEdit(application:Application){
    this.isEditMode = true;
    this.currentApplication = {
      applicationName :application.applicationName,
      applicationCountry: application.applicationCountry,
      applicationDescription:application.applicationDescription,
      headerBanner:application.headerBanner,
      destinationCountry:application.destinationCountry,
      applicationGuid:application.applicationGuid,
      tenantGuid:""
    }
    this.displayAddAppModal = true;
  }
  closeModal(){
    this.isEditMode =false;
    this.displayAddAppModal = false;
    this.currentApplication = {
      applicationName :"",
      applicationCountry: "",
      applicationDescription:"",
      headerBanner:"",
      destinationCountry:"",
      tenantGuid:""
    }
  }
  saveApplication(){
    if(!this.currentApplication) return;
    if(!this.isEditMode) this.addApplication();
    else this.updateApplication();
  }
  openDeleteDialog(application:NewApplication){
      this.currentApplication.applicationGuid = application.applicationGuid;
      this.displayDeleteDialog = true;
    }
  closeDeleteDialog(){
      this.displayDeleteDialog = false;
  }

  addApplication(){
    this.currentApplication.tenantGuid = "b6fcc1f1-2f7f-4adc-9c07-09d06651197d";
    this.adminDashboardService.createApplication(this.currentApplication).subscribe({
      next:(data) => {
        this.toast.success("Application Added Successfully", "success");
        // re-fetch data
        this.fetchApplications();
        this.closeModal();
      },
      error:(error) =>{
        this.toast.error("Error while creating application", "Error");
        this.closeModal();
      }
    })
  }
  updateApplication(){
    this.currentApplication.tenantGuid = "b6fcc1f1-2f7f-4adc-9c07-09d06651197d";
    this.adminDashboardService.updateApplication(this.currentApplication.applicationGuid , this.currentApplication).subscribe({
      next:(data) => {
        this.toast.success("Application updated Successfully", "success");
        // re-fetch data
        this.fetchApplications();
        this.closeModal();
      },
      error:(error) =>{
        this.toast.error("Error while updating application", "Error");
        this.closeModal();
      }
    })
  }
  deleteApplication(){
   if(this.currentApplication.applicationGuid){
    this.adminDashboardService.deleteApplication(this.currentApplication.applicationGuid).subscribe({
      next:(data) => {
        this.toast.success("Application deleted Successfully", "success");
        // re-fetch data
        this.fetchApplications();
        this.closeDeleteDialog();
      },
      error:(error) =>{
        this.toast.error("Error while deleting application", "Error");
        this.closeDeleteDialog();
      }
    })
   }
  }
  fetchApplications(){
    this.adminDashboardService.fetchAllApplications().subscribe({
      next: (data) => {
        this.applications = data;
      },
      error: (error) => {
        console.log(`error fetching applications: ${error}`);
      },
    });
  }
}
