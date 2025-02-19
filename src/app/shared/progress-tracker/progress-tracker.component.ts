import { CommonModule, formatPercent } from '@angular/common';
import {
  Component,
  EventEmitter,
  Input,
  OnChanges,
  OnInit,
  Output,
  SimpleChanges,
} from '@angular/core';
import { MatIconModule } from '@angular/material/icon';
import { AuthService } from '@auth0/auth0-angular';
import { formatDate } from '../../../util/utility';
import { ApplicationStep } from '../../../util/types';
import { Store } from '@ngrx/store';
import { selectUserType } from '../../core/session/session.selectors';
import { Observable } from 'rxjs';
import { AdminDashboardService } from '../../core/service/admin-dashboard.service';
import { HttpClientModule } from '@angular/common/http';
import { ToastrService } from 'ngx-toastr';
import { TabViewModule } from 'primeng/tabview';
import { DialogModule } from 'primeng/dialog';
import { TagModule } from 'primeng/tag';
import { ButtonModule } from 'primeng/button';

type StepStatus = 'default' | 'blue' | 'confirmed' | 'red';

@Component({
  selector: 'progress-tracker',
  standalone: true,
  imports: [
    CommonModule,
    MatIconModule,
    HttpClientModule,
    TagModule,
    ButtonModule,
    TabViewModule,
    DialogModule,
  ],
  providers: [AdminDashboardService],
  templateUrl: './progress-tracker.component.html',
  styleUrls: ['./progress-tracker.component.css'],
})
export class ProgressTrackerComponent implements OnInit, OnChanges {
  @Input() applicationSteps: ApplicationStep[] = [];
  @Input() appInstancecurrentStepGuid :string = "";
  @Input() isForEmployerOrUser:boolean = true;
  @Output() changeCurrentStepGuidEmitter = new EventEmitter<string>();
  @Output() changeCurrentStepGuidAdminEmitter = new EventEmitter<string>();
  @Output() fetchApplicationDataEmitter = new EventEmitter<any>();
  @Output() openAddStepModalEmitter = new EventEmitter<any>();
  @Output() openDeleteStepModalEmitter = new EventEmitter<ApplicationStep>();
  @Output() openEditStepModalEmitter = new EventEmitter<ApplicationStep>();
  displayDialog = false;
  userTypeFromSession: Observable<any>;
  userType: string;
  formatDatefunc = formatDate;
  actionToConfirm: string;
  currentStep:ApplicationStep|null = null;

  constructor(
    public auth: AuthService,
    private store: Store,
    private adminDashboardService: AdminDashboardService,
    private toast: ToastrService
  ) {}
  changeCurrentStep(appStepGuid, stepOrder) {
    var currentStep = this.getAppInstanceCurrentStepOrder(this.appInstancecurrentStepGuid);
    if(this.userType !== "ADMIN"){
      if(stepOrder > currentStep?.applicationStepOrder){
        if(!this.getAppInstanceCurrentStepOrder(appStepGuid)?.applicationInstanceStepGuid){
          this.toast.info("You will be able to acess the next step after completing all the previous ones", "Step Info");
          return;
        }
      }
    }
    this.changeCurrentStepGuidEmitter.emit(appStepGuid);
  }
  getAppInstanceCurrentStepOrder(stepGuid){
   const res =  this.applicationSteps.find(step => step.applicationStepGuid === stepGuid);
   return res;
  }
  ngOnInit(): void {
    this.userTypeFromSession = this.store.select(selectUserType);
    this.userTypeFromSession.subscribe((userType) => {
      this.userType = userType;
    });
  }
  ngOnChanges(changes: SimpleChanges): void {
    if (changes['applicationSteps'] && this.applicationSteps?.length > 0) {
      // Update step statuses when applicationSteps input changes
      this.applicationSteps.forEach((step) => {
        step.created = formatDate(step.instanceCreated)
        if (step.instanceCompleted) step.stepStatus = 'confirmed';
        else if (step.instanceRejected) step.stepStatus = 'red';
        else if (step.instanceCreated) step.stepStatus = 'blue';
        else step.stepStatus = 'default';
      });
    }
  }
  openDialog(action: string, step:ApplicationStep): void {
    this.actionToConfirm = action;
    this.currentStep = step;
    this.displayDialog = true;
  }
  closeDialog(): void {
    this.displayDialog = false;
  }

  confirmAction(): void {
    if (this.actionToConfirm === 'complete') {
      this.updateStep(this.currentStep);
    } else if (this.actionToConfirm === 'create') {
      this.createStep(this.currentStep);
    }
    this.closeDialog();
  }
  updateStep(step:ApplicationStep) {
    this.adminDashboardService
      .updateApplicationInstanceStep(step.applicationInstanceGuid, step.applicationInstanceStepGuid)
      .subscribe({
        next: (data) => {
          this.toast.success('Step Completed Successfully', 'Success');
          this.fetchApplicationDataEmitter.emit();
        },
        error: (error) => {
          console.log('Error updating step: ', error);
          this.toast.error('Error while updating the step ', 'Error');
        },
      });
  }
  createStep(step:ApplicationStep) {
    this.adminDashboardService
      .createApplicationInstanceStep(step.applicationInstanceGuid, step.applicationStepGuid)
      .subscribe({
        next: (data) => {
          this.toast.success('Step Created Successfully', 'Success');
          this.fetchApplicationDataEmitter.emit();
        },
        error: (error) => {
          console.log('Error Creating step: ', error);
          this.toast.error('Error while updating the step ', 'Error');
        },
      });
  }
  openAddStepModal(){
    this.openAddStepModalEmitter.emit();
  }
  openModalForEdit(step:ApplicationStep){
    this.openEditStepModalEmitter.emit(step);
  }
  openDeleteStepModal(step:ApplicationStep){
    this.openDeleteStepModalEmitter.emit(step);
  }
 changeCurrentStepGuidAdmin(stepGuid){
  this.changeCurrentStepGuidAdminEmitter.emit(stepGuid);
 }
}
