import { Component,ChangeDetectorRef, EventEmitter, Input, OnInit, Output, Renderer2, SimpleChange, SimpleChanges } from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';
import { CommonModule } from '@angular/common';
import { HttpClientModule } from '@angular/common/http';
import { clearSelectedApplicationGuid, clearSelectedFormGuid, clearWebFormInstanceGuid, setSelectedApplicationGuid, setSelectedFilloutIdentifier, setSelectedFormGuid } from '../../core/session/session.actions';
import { Store } from '@ngrx/store';
import { DataService } from '../../core/service/data.service';
import { Observable, Subject, takeUntil } from 'rxjs';
import { InfoMessageComponent } from '../../shared/info-message/info-message.component';

@Component({
  selector: 'app-webforms',
  standalone: true,
  imports: [CommonModule, HttpClientModule, InfoMessageComponent],
  templateUrl: './webforms.component.html',
  styleUrl: './webforms.component.css',
  providers:[DataService]
})
export class WebformsComponent implements OnInit {
  @Input() applicationGuid: string;
  @Input() applicationInstanceStepGuid:string;
  @Input() forms:any[] = null;
  @Input() currentStepGuid:string = ""
  @Input() currentappinstGuid:string = ""
  @Output() tabChange = new EventEmitter<number>();
  isCurrentStepInformational:boolean|string = false;

  private unsubscribe$ = new Subject<void>();
  userId:string;
  isModalOpen = false;
  webFormInstanceGuid: string = '';
  selectedFormGuid$: Observable<string | null>;

  constructor(
    private dataService: DataService, 
    private route: ActivatedRoute,
    private store:Store, 
    private router:Router,
    private cdr:ChangeDetectorRef
  ){}
  ngOnChanges(changes: SimpleChanges): void {
    if (changes['forms'] || changes['currentStepGuid'] || changes['currentappinstGuid'] || changes['isCurrentStepInformational']) {
      this.cdr.detectChanges();
    }
    this.route.queryParamMap.subscribe((params) => {
      this.isCurrentStepInformational = params.get('isCurrentStepInformational')
      this.cdr.detectChanges();
    });
  }
  ngOnInit(): void { 
    this.route.queryParamMap.subscribe((params) => {
      this.isCurrentStepInformational = params.get('isCurrentStepInformational')
      this.cdr.detectChanges();
    });
  }
  emitAllFormsCompletedEvent(){
    this.tabChange.emit(1);
  }
  onFormClick(formGuid: string, webformName:string): void {
    const reqBody: any = {};
    this.dataService
      .createWebFormInstance(formGuid, reqBody, this.currentStepGuid)
      .pipe(takeUntil(this.unsubscribe$))
      .subscribe((webFormInstance: any) => {
        this.dataService
          .getWebFormJson(formGuid)
          .pipe(takeUntil(this.unsubscribe$))
          .subscribe({
            next: (response: any) => {
              this.webFormInstanceGuid = webFormInstance.webFormInstanceGuid;
              const filloutFormIdentifier = response.filloutFormIdentifier;
              this.loadData();
              this.setApplicationGuid(this.applicationGuid);
              this.router.navigate([
                `form-manager/${this.applicationGuid}/${this.currentappinstGuid}/filloutForm`,
              ], {
                queryParams: { filloutFormIdentifier, webformName, webFormInstanceGuid:this.webFormInstanceGuid, showFullContent:false},
                state: {applicationGuid: this.applicationGuid}
              });
            },
            error: (error) => console.error(error),
          });
      });
  }
  

  loadData(): void {  
    this.dataService
    .createWebFormInstanceApplication(
      this.webFormInstanceGuid,
      this.applicationGuid
    )
    .pipe(takeUntil(this.unsubscribe$))
    .subscribe(() => {
    });
  }

  isAllFormsCompleted(): boolean {
    if(this.forms === null) return false;
    if (this.forms.length === 0) return true;
    return this.forms.every(form => form.completedDateTime != null);

  }
  getCompletedFormsCount(): number {
    return this.forms.filter(form => form.completedDateTime !== null).length;
  }
  selectFilloutIdentifier(filloutIdentifier: string) {
    this.store.dispatch(setSelectedFilloutIdentifier({ filloutIdentifier }));
  }
  setApplicationGuid(selectedApplicationGuid: string) {
    this.store.dispatch(setSelectedApplicationGuid({ selectedApplicationGuid }));
  }
  removeSelectForm() {
    this.store.dispatch(clearSelectedFormGuid());
  }

  removeWebFormInstance() {
    this.store.dispatch(clearWebFormInstanceGuid());
  }

}
