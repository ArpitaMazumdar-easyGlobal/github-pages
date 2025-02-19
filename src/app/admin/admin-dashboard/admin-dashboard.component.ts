import { CommonModule } from '@angular/common';
import { Component, OnInit } from '@angular/core';
import { AuthService } from '@auth0/auth0-angular';
import { AdminDashboardService } from '../../core/service/admin-dashboard.service';
import { EmployerComponent } from '../employer/employer.component';
import { HttpClientModule } from '@angular/common/http';
import { Application } from '../../../util/types';
import { ApplicationsComponent } from '../applications/applications.component';

interface Employers {
  employerGuid: string;
  employerName: string;
  signUpDate: string;
  calendlyBookingLink: string;
}

@Component({
  selector: 'app-admin-dashboard',
  standalone: true,
  imports: [CommonModule, HttpClientModule, EmployerComponent, ApplicationsComponent],
  templateUrl: './admin-dashboard.component.html',
  styleUrl: './admin-dashboard.component.css',
  providers: [AuthService, AdminDashboardService],
})
export class AdminDashboardComponent implements OnInit {
  employers: Employers[] = [];
  applications: Application[] =[];

  constructor(
    private authService: AuthService,
    private adminDashboardService: AdminDashboardService
  ) {}

  ngOnInit(): void {
    this.authService.isAuthenticated$.subscribe((isAuthenticated) => {
      if (isAuthenticated) {

      }
    });
  }
}
