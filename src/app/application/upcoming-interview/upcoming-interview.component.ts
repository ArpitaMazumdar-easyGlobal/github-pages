import { Component, OnInit } from '@angular/core';
import { Store } from '@ngrx/store';
import { selectUserType } from '../../core/session/session.selectors';
import { Observable, of } from 'rxjs';
import { CommonModule } from '@angular/common';
import { HttpClientModule } from '@angular/common/http';
import {
  AddInterview,
  Employer,
  Interview,
  MatchedCandidate,
} from '../../../util/types';
import { TagModule } from 'primeng/tag';
import { ButtonModule } from 'primeng/button';
import { ToastrService } from 'ngx-toastr';
import { TabViewModule } from 'primeng/tabview';
import { DialogModule } from 'primeng/dialog';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';
import { InputTextModule } from 'primeng/inputtext';
import { CalendarModule } from 'primeng/calendar';
import { NgSelectModule } from '@ng-select/ng-select';
import { DataService } from '../../core/service/data.service';
import { AdminDashboardService } from '../../core/service/admin-dashboard.service';
import { getAllTimeZones } from '../../../util/utility';
@Component({
  selector: 'app-upcoming-interview',
  standalone: true,
  imports: [
    CommonModule,
    HttpClientModule,
    TagModule,
    ButtonModule,
    TabViewModule,
    DialogModule,
    FormsModule,
    CalendarModule,
    InputTextModule,
    ReactiveFormsModule,
    NgSelectModule,
  ],
  providers: [DataService, ToastrService, AdminDashboardService],
  templateUrl: './upcoming-interview.component.html',
  styleUrl: './upcoming-interview.component.css',
})
export class UpcomingInterviewComponent implements OnInit {
  userTypeFromSession: Observable<string>;
  userType: string;
  employers: Employer[];
  selectedEmployer: Employer;
  selectedCandidate: MatchedCandidate;
  employerMatchedCandidates: MatchedCandidate[] = [];
  interviews: Interview[] = [];
  displayAddInterviewModal: boolean = false;
  currentInterview: AddInterview = {
    upcomingInterviewGuid:'',
    matchedCandidatesGuid: '',
    interviewStartDateTime: '',
    interviewEndDateTime: '',
    joiningUrl: '',
    employerGuid: '',
    timeZone:'UTC'
  };
  startTimeError: string = '';
  endTimeError: string = '';
  joiningUrlError: string = '';
  isEditMode:boolean = false; // this is to track the mode of modal (add or update)
  displayEditInterviewModal: boolean = false; 
  displayDeleteDialog:boolean = false;
  timezones:string[] =[];

  constructor(
    private store: Store,
    private toast: ToastrService,
    private dataService: DataService,
    private adminService: AdminDashboardService
  ) {}

  ngOnInit(): void {
    this.userTypeFromSession = this.store.select(selectUserType);
    this.userTypeFromSession.subscribe((userType) => {
      this.userType = userType;
    });
    this.timezones = getAllTimeZones();
    this.fetchUpcomingInterviewsData();
    if(this.userType === 'ADMIN') this.fetchEmployersData();
  }
  // to fetch all the upcoming interviews to populate the table
  fetchUpcomingInterviewsData(){
    if(this.userType === 'ADMIN') this.fetchUpcomingInterviewsDataForAdmin();
    if(this.userType === 'EMPLOYER') this.fetchUpcomingInterviewsDataForEmployer();
  }
  fetchUpcomingInterviewsDataForAdmin() {
    this.dataService.getUpcomingInterviews().subscribe({
      next: (data) => {
       this.formatInterviewsData(data);
      },
      error: (error) => {
        console.log('Error fetching upcoming interviews', error);
      },
    });
  }
  fetchUpcomingInterviewsDataForEmployer() {
    this.dataService.getUpcomingInterviewForEmployer().subscribe({
      next: (data) => {
        this.formatInterviewsData(data);
      },
      error: (error) => {
        console.log('Error fetching upcoming interviews for employer', error);
      },
    });
  }
  openModalForAdd() {
    this.isEditMode = false;
    this.currentInterview = {
      upcomingInterviewGuid:'',
      matchedCandidatesGuid: '',
      interviewStartDateTime: '',
      interviewEndDateTime: '',
      joiningUrl: '',
      employerGuid: '',
      timeZone:'UTC'
    };
    this.displayAddInterviewModal = true;
  }
  openModalForEdit(interview: Interview) {
    this.isEditMode = true;
    this.currentInterview = {
      upcomingInterviewGuid:interview.upcomingInterviewsGuid,
      matchedCandidatesGuid: interview.matchedCandidatesGuid,
      interviewStartDateTime: interview.interviewStartDateTime,
      interviewEndDateTime: interview.interviewEndDateTime,
      joiningUrl: interview.joiningUrl,
      employerGuid: interview.employerGuid,
      timeZone: interview.timeZone
    };
    this.displayAddInterviewModal = true;
  }
  saveInterview() {
    if (!this.currentInterview) return;
    if(this.joiningUrlError || this.startTimeError || this.endTimeError) {
      this.toast.error("Please provide valid details", "Error")
      return;
    }
    if(!this.isEditMode) this.addInterview();
    else this.updateInterview()

  }
  closeModal() {
    this.currentInterview = {
      upcomingInterviewGuid:'',
      matchedCandidatesGuid: '',
      interviewStartDateTime: '',
      interviewEndDateTime: '',
      joiningUrl: '',
      employerGuid: '',
      timeZone:'UTC'
    };
    this.displayAddInterviewModal = false;
  }
  // to fetch all the employer's data to populate the empolyer dropdown for adding a new upcoming interview
  fetchEmployersData() {
    this.adminService.getAllEmployers().subscribe({
      next: (data) => {
        this.employers = data.map((item) => item.employerDetails);
      },
      error: (error) => {
        console.log('Error fetching employers data', error);
      },
    });
  }
  fetchMatchedCandidatesForEmployer(employerGuid: string) {
    if (!employerGuid) return;
    this.dataService
      .getAllMatchedCandidatesForEmployerByEmployerGuid(employerGuid)
      .subscribe({
        next: (data) => {
          this.employerMatchedCandidates = data;
          this.employerMatchedCandidates = this.employerMatchedCandidates.map(
            (candidate) => {
              return {
                ...candidate,
                displayLabel: `${candidate.candidateFirstName} (${candidate.candidateEmail})`,
              };
            }
          );
        },
        error: (error) => {
          console.log(
            'Error fetching candidates for selected employer, ',
            error
          );
        },
      });
  }

  onEmployerChange(emp: Employer) {
    this.selectedEmployer = emp;
    this.currentInterview.employerGuid = emp.employerGuid;
    this.fetchMatchedCandidatesForEmployer(this.selectedEmployer.employerGuid);
  }
  onCandidateChange(candidate: MatchedCandidate) {
    this.selectedCandidate = candidate;
    this.currentInterview.matchedCandidatesGuid = candidate.matchedCandidateGuid;
  }
  getOptionLabel(candidate: any): string {
    return `${candidate.candidateFirstName} (${candidate.email})`;
  }
  formatDate(dateString: string): string {
    const options: Intl.DateTimeFormatOptions = {
      day: '2-digit',
      month: 'short',
      hour: '2-digit',
      minute: '2-digit',
      hour12: true,
    };

    const date = new Date(dateString);
    return date.toLocaleDateString('en-US', options);
  }

  // Validating joining URL
  validateJoiningUrl() {
    if (!this.currentInterview.joiningUrl.startsWith('https://calendly.com')) {
      this.joiningUrlError = 'Please Enter a valid calendly URL';
    } else {
      this.joiningUrlError = '';
    }
    return true;
  }
  // Validating start and end time
  validateStartEndTime() {
    const startTime = new Date(this.currentInterview.interviewStartDateTime);
    const endTime = new Date(this.currentInterview.interviewEndDateTime);

    if (!startTime || !endTime) return;

    if (startTime >= endTime) {
      this.endTimeError = 'End time must be after start time.';
    } else {
      this.endTimeError = '';
    }
  }
  // 
  confirmDelete(interview:Interview){
    this.currentInterview.upcomingInterviewGuid = interview.upcomingInterviewsGuid;
    this.displayDeleteDialog = true;
  }
  closeDeleteDialog(){
    this.displayDeleteDialog = false;
  }
  // Function to handle updating the interview
  updateInterview() {
    this.dataService.updateUpcomingInterview(this.currentInterview).subscribe({
      next: (_) => {
        this.toast.success('Interview updated successfully', 'Success');
        this.fetchUpcomingInterviewsData();
        this.closeModal();
      },
      error: (error) => {
        this.toast.error('Error updating interview', 'Error');
        console.log('Error updating interview', error);
        this.closeModal();
      },
    });
  }

  // Function to add new upcoming interview 
  addInterview(){
    this.dataService.addUpcomingInterview(this.currentInterview).subscribe({
      next: (_) => {
        this.toast.success('interview added successfully', 'Sucess');
        this.fetchUpcomingInterviewsData();
        this.closeModal();
      },
      error: (error) => {
        this.toast.error('Error adding interviews', 'error');
        console.log('error adding new interview', error);
        this.closeModal();
      }
    });
  }
  // Function to delete an interview
  deleteInterview() {
    if(!this.currentInterview.upcomingInterviewGuid) return ;
    this.dataService.deleteUpcomingInterview(this.currentInterview.upcomingInterviewGuid).subscribe({
      next: (_) => {
        this.toast.success('Interview deleted successfully', 'Success');
        this.fetchUpcomingInterviewsData();
        this.displayDeleteDialog = false;
      },
      error: (error) => {
        this.toast.error('Error deleting interview', 'Error');
        console.log('Error deleting interview', error);
        this.displayDeleteDialog = false;
      },
    });
  }
  formatInterviewsData(data){
    this.interviews = data.map((interview) => ({
      ...interview,
      formattedStartTime: this.formatDate(interview.interviewStartDateTime),
      formattedEndTime: this.formatDate(interview.interviewEndDateTime),
    }));
  }
}
