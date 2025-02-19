import { Component, OnInit } from '@angular/core';
import { Applicant } from '../../../util/types';
import { AdminDashboardService } from '../../core/service/admin-dashboard.service';
import { HttpClientModule } from '@angular/common/http';
import { CommonModule } from '@angular/common';
import { Router } from '@angular/router';
import { TableModule } from 'primeng/table';

@Component({
  selector: 'app-applicants',
  standalone: true,
  imports: [CommonModule, HttpClientModule, TableModule],
  providers: [AdminDashboardService],
  templateUrl: './applicants.component.html',
  styleUrl: './applicants.component.css',
})
export class ApplicantsComponent implements OnInit {
  applicants: Applicant[] = [];

  constructor(
    private adminDashboardService: AdminDashboardService,
    private router: Router
  ) {}

  ngOnInit(): void {
    this.adminDashboardService.getAllApplicants().subscribe({
      next: (data) => {
        this.applicants = data;
      },
      error: (error) => {
        console.log('Error occured while fetching All Applicants:', error);
      },
    });
  }

  viewApplicantPage(userGuid: string): void {
    this.router.navigate(['//admin/applicant', userGuid]);
  }
}
