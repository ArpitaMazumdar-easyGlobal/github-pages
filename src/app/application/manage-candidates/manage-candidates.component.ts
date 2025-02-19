import {
  Component,
  Input,
  OnChanges,
  OnInit,
  SimpleChange,
  SimpleChanges,
} from '@angular/core';
import { DataService } from '../../core/service/data.service';
import { CommonModule } from '@angular/common';
import { HttpClientModule } from '@angular/common/http';
import { MatchedCandidate } from '../../../util/types';
import { TagModule } from 'primeng/tag';
import { ButtonModule } from 'primeng/button';
import { TooltipModule } from 'primeng/tooltip';
import { ToastrService } from 'ngx-toastr';
import { TabViewModule } from 'primeng/tabview';
import { DialogModule } from 'primeng/dialog';
import { TableModule } from 'primeng/table';
import { IconFieldModule } from 'primeng/iconfield';
import { InputIconModule } from 'primeng/inputicon';
import { InputTextModule } from 'primeng/inputtext';
import { MultiSelectModule } from 'primeng/multiselect';
import { FilloutComponent } from '../fillout/fillout.component';
import { Store } from '@ngrx/store';
import {
  selectEmployerName,
  selectSessionState,
  selectUserType,
} from '../../core/session/session.selectors';
import { AdminDashboardService } from '../../core/service/admin-dashboard.service';
import { Session } from '../../core/session/session.model';

interface Tabs {
  title: string;
  candidates: any[];
}
@Component({
  selector: 'app-manage-candidates',
  standalone: true,
  imports: [
    CommonModule,
    HttpClientModule,
    TagModule,
    ButtonModule,
    TabViewModule,
    DialogModule,
    TooltipModule,
    TableModule,
    IconFieldModule,
    InputTextModule,
    InputIconModule,
    MultiSelectModule,
    FilloutComponent,
  ],
  providers: [DataService, ToastrService],
  templateUrl: './manage-candidates.component.html',
  styleUrl: './manage-candidates.component.css',
})
export class ManageCandidatesComponent implements OnInit, OnChanges {
  @Input() empGuid: string;
  @Input() empNameInput:string;

  matchedCandidatesList: MatchedCandidate[] = [];
  selectedCandidate: MatchedCandidate = {
    matchedCandidateGuid: '',
    candidateUserGuid: '',
    employerGuid: '',
    candidateSalutation: null,
    candidateFirstName: '',
    candidateLastName: '',
    candidateCountry: '',
    matchScore: null,
    resumeBlobStorageURL: null,
    statusValueCode: '',
    documentGuid: '',
    candidateEmail: '',
    displayLabel: null,
    isInterviewLinkSent: false,
  };

  displayDialog: boolean = false;
  actionToConfirm: string = '';
  displayBookInterviewModal: boolean = false;

  employerName: string | null = null;
  employerSchedulingFormId: string | null = null;
  userType: string;
  session:any;

  tabs: Tabs[] = [
    { title: ' Matched Candidates', candidates: [] },
    { title: 'Shortlisted', candidates: [] },
    { title: 'Finalized', candidates: [] },
    { title: 'Rejected ', candidates: [] },
  ];
  constructor(
    private dataService: DataService,
    private toast: ToastrService,
    private store: Store,
    private adminService: AdminDashboardService
  ) {}
  ngOnInit(): void {
    this.store.select(selectSessionState).subscribe((session) => {
      this.session = session;
      this.userType = session.session.userType;
      this.employerName = session.session.employerName;
      this.employerSchedulingFormId = session.session.employerSchedulingFormId;
    this.fetchCandidatesData();
    });
  }
  ngOnChanges(changes: SimpleChanges): void {
    if (changes['matchedCandidatesList']) {
      this.groupSameStatusCandidates(this.matchedCandidatesList);
    }
  }
  downloadResume(doc: MatchedCandidate) {
    this.dataService.downladFile(doc.documentGuid).subscribe({
      next: (response: any) => {
        const blob = new Blob([response.body], { type: 'application/octet-stream' });
        const url = window.URL.createObjectURL(blob);

        const contentDisposition = response.headers.get('Content-Disposition');
    
        let filename = 'downloaded_file';
        if (contentDisposition) {
          const match = contentDisposition.match(/filename="(.+)"/);
          if (match?.[1]) {
            filename = match[1];
          }
        }

        const a = document.createElement('a');
        a.href = url;
        a.download = filename;
        a.click();

        // Clean up resources
        window.URL.revokeObjectURL(url);
        this.toast.success('Resume downloaded successfully');
      },
      error: (error) => {
        this.toast.error('Error occurred while downloading the resume');
        console.error(
          `Error occurred while downloading the resume: ${error.message}`
        );
      },
    });
  }

  updateCandidateStatus(doc: MatchedCandidate, status: string) {
    this.dataService
      .updateMatchedCandidateStatus(doc.matchedCandidateGuid, status)
      .subscribe({
        next: (data) => {
          this.toast.success(`Candidate successfully ${status}`);
          this.fetchCandidatesData();
        },
        error: (error) =>
          this.toast.error(`Error Occurred while ${status} the candidate`),
      });
  }

  onBookInterview(doc: MatchedCandidate) {
    this.dataService
      .sendBookInterviewRequest(doc.matchedCandidateGuid)
      .subscribe({
        next: () => {
          this.toast.success('Interview link sent successfully');
          this.fetchCandidatesData();
        },
        error: (error) =>
          this.toast.error(`Error sending interveiw booking link, ${error}`),
      });
  }

  fetchCandidatesData() {
    let candidatesObservable;
    if (this.userType === 'ADMIN') {
      candidatesObservable = this.adminService.getAllMatchedCandidates(
        this.empGuid
      );
    } else if (this.userType === 'EMPLOYER') {
      candidatesObservable =
        this.dataService.getAllMatchedCandidatesForEmployer();
    } else {
      console.error(`Unsupported user type: ${this.userType}`);
      return;
    }
    candidatesObservable.subscribe({
      next: (data) => {
        this.matchedCandidatesList = data;
        console.log(data);
        this.groupSameStatusCandidates(this.matchedCandidatesList);
      },
      error: (error) => {
        console.error('Error occurred while fetching candidates', error);
      },
    });
  }
  groupSameStatusCandidates(candidates: MatchedCandidate[]) {
    this.tabs[0].candidates = candidates.filter(
      (doc) => doc.statusValueCode === 'MATCHED'
    );
    this.tabs[0].candidates.sort((a, b) => b.matchScore - a.matchScore);

    this.tabs[1].candidates = candidates.filter(
      (doc) => doc.statusValueCode === 'SHORTLISTED'
    );
    this.tabs[1].candidates.sort((a, b) => b.matchScore - a.matchScore);

    this.tabs[2].candidates = candidates.filter(
      (doc) => doc.statusValueCode === 'FINALIZED'
    );
    this.tabs[2].candidates.sort((a, b) => b.matchScore - a.matchScore);

    this.tabs[3].candidates = candidates.filter(
      (doc) => doc.statusValueCode === 'REJECTED'
    );
    this.tabs[3].candidates.sort((a, b) => b.matchScore - a.matchScore);
  }
  opeDialog(doc: MatchedCandidate, action: string) {
    this.selectedCandidate = doc;
    this.actionToConfirm = action;
    this.displayDialog = true;
  }
  closeDialog() {
    this.selectedCandidate = null;
    this.actionToConfirm = '';
    this.displayDialog = false;
  }
  confirmAction() {
    if (!this.selectedCandidate || !this.actionToConfirm) return;
    if (this.actionToConfirm === 'Send Interview Request')
      this.onBookInterview(this.selectedCandidate);
    else
      this.updateCandidateStatus(this.selectedCandidate, this.actionToConfirm);
    this.closeDialog();
  }
  openBookInterviewModal(candidate: MatchedCandidate) {
    this.selectedCandidate = candidate;
    this.displayBookInterviewModal = true;
  }
  closeBookInterviewModal() {
    this.displayBookInterviewModal = false;
  }
}
