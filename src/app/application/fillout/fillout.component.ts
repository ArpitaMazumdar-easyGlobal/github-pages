import { CommonModule, Location } from '@angular/common';
import {
  ChangeDetectorRef,
  Component,
  ElementRef,
  EventEmitter,
  Input,
  OnChanges,
  OnDestroy,
  OnInit,
  Output,
  SimpleChange,
  SimpleChanges,
  ViewChild,
} from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';
import { environment } from '../../../environments/environment.development';
import { Observable, Subject, takeUntil } from 'rxjs';
import { Store } from '@ngrx/store';
import {
  getTokenFromSession,
  selectApplicationGuid,
  selectSessionState,
  selectUserType,
} from '../../core/session/session.selectors';
import { clearSelectedApplicationGuid } from '../../core/session/session.actions';
import { DataService } from '../../core/service/data.service';
import { HttpClientModule } from '@angular/common/http';
import { TagModule } from 'primeng/tag';
import { ButtonModule } from 'primeng/button';
import { TabViewModule } from 'primeng/tabview';
import { DialogModule } from 'primeng/dialog';
import { FormsModule } from '@angular/forms';
import { AdminDashboardService } from '../../core/service/admin-dashboard.service';
import { AutoFillRequest } from '../../../util/types';
import { ToastrService } from 'ngx-toastr';
import { SessionState } from '../../core/session/session.model';
@Component({
  selector: 'app-fillout',
  standalone: true,
  imports: [
    CommonModule,
    HttpClientModule,
    TagModule,
    ButtonModule,
    TabViewModule,
    DialogModule,
    FormsModule,
  ],
  templateUrl: './fillout.component.html',
  styleUrl: './fillout.component.css',
  providers: [DataService, AdminDashboardService, ToastrService],
})
export class FilloutComponent implements OnInit, OnChanges, OnDestroy {
  @Input() isChild: boolean = false;
  @Input() parentApplicationGuid: string | null = null;
  @Input() parentWebFormInstanceGuid: string | null = null;
  @Input() parentFilloutFormIdentifier: string | null = null;
  @Input() parentWebformName: string | null = null;
  @Input() parentWebformGuid: string | null = null;
  @Input() parentAutoFillData: any[] = [];
  @Input() parentAppInstanceGuid: string | null = null;

  @ViewChild('filloutFormContainer', { static: false })
  formContainer!: ElementRef;
  selectedFormGuid$: Observable<string | null>;
  selectedSession$: Observable<SessionState | null>;
  session: any;
  private unsubscribe$ = new Subject<void>();

  userTypeFromSession: Observable<string>;
  userType: string;

  tokenFromSession: any;
  token: string;
  applicationGuid: string;
  appInstanceGuid: string;
  webFormInstanceGuid: string;
  filloutFormIdentifier: string;
  webformName: string;
  webformGuid: string;

  displayModal = false;
  autoFillValue = '';

  private scriptUrl = 'https://server.fillout.com/embed/v1/';
  private handleMessageBound!: (event: MessageEvent) => void;

  constructor(
    private route: ActivatedRoute,
    private location: Location,
    private router: Router,
    private store: Store,
    private cdr: ChangeDetectorRef,
    private dataService: DataService,
    private adminDashboardService: AdminDashboardService,
    private toast: ToastrService
  ) {
    //this.router.routeReuseStrategy.shouldReuseRoute = () => false;
  }

  ngOnInit(): void {
    this.handleMessageBound = this.handleFormSubmissionMessage.bind(this);
    window.addEventListener('message', this.handleMessageBound, false);
    this.tokenFromSession = this.store.select(getTokenFromSession);
    this.tokenFromSession.subscribe((token) => {
      this.token = token;
    });
    this.userTypeFromSession = this.store.select(selectUserType);
    this.userTypeFromSession.subscribe((userType) => {
      this.userType = userType;
    });
    this.selectedFormGuid$ = this.store.select(selectApplicationGuid);
    this.selectedSession$ = this.store.select(selectSessionState);
    this.selectedSession$
      .pipe(takeUntil(this.unsubscribe$))
      .subscribe((selectedSession) => {
        this.session = selectedSession;
        console.log('session from fillout', this.session);
      });
    this.selectedFormGuid$
      .pipe(takeUntil(this.unsubscribe$))
      .subscribe((selectApplicationGuid) => {
        if (selectApplicationGuid != null) {
          this.applicationGuid = selectApplicationGuid;
        }
      });

    if (this.isChild) {
      this.applicationGuid = this.parentApplicationGuid || '';
      this.webFormInstanceGuid = this.parentWebFormInstanceGuid || '';
      this.filloutFormIdentifier = this.parentFilloutFormIdentifier || '';
      this.webformName = this.parentWebformName || '';
      this.webformGuid = this.parentWebformGuid || '';
      this.appInstanceGuid = this.parentAppInstanceGuid || '';
    } else {
      this.route.parent.params.subscribe((params) => {
        this.appInstanceGuid = params['insId'];
      });
      // Fetch data from query parameters for independent usage
      this.route.params.subscribe((params) => {
        this.webFormInstanceGuid = params['webFormInstanceGuid'];
      });
      this.route.queryParams.subscribe((queryParams) => {
        this.webFormInstanceGuid = queryParams['webFormInstanceGuid'];
        this.filloutFormIdentifier = queryParams['filloutFormIdentifier'];
        this.webformName = queryParams['webformName'];
        this.fetchAutoFillData();
      });
    }
  }

  ngOnChanges(changes: SimpleChanges): void {
    if (changes['isChild'] || changes['parentApplicationGuid']) {
      if (this.isChild) {
        this.applicationGuid = this.parentApplicationGuid || '';
        this.webFormInstanceGuid = this.parentWebFormInstanceGuid || '';
        this.filloutFormIdentifier = this.parentFilloutFormIdentifier || '';
        this.webformName = this.parentWebformName || '';
        this.fetchAutoFillData();
      }
    }
  }

  loadFilloutForm(autofillValues: any): void {
    const script = document.createElement('script');
    script.type = 'text/javascript';
    script.src = this.scriptUrl;
    script.onload = () => {
      console.log('Fillout script loaded');
    };
    script.onerror = () => {
      console.error('Error loading Fillout script');
    };
    document.body.appendChild(script);

    if (!this.formContainer) {
      console.error('FilloutFormContainer not found');
      return;
    }

    while (this.formContainer.nativeElement.firstChild) {
      this.formContainer.nativeElement.removeChild(
        this.formContainer.nativeElement.firstChild
      );
    }
    const div = document.createElement('div');
    div.dataset['filloutId'] = this.filloutFormIdentifier;
    div.dataset['filloutEmbedType'] = 'standard';
    div.dataset['appguid'] = this.applicationGuid;
    div.dataset['appinstanceguid'] = this.appInstanceGuid;
    if (this.webFormInstanceGuid)
      div.dataset['forminstance'] = this.webFormInstanceGuid;
    div.dataset['domain'] = window.location.hostname;
    autofillValues.forEach((element) => {
      div.dataset[element.parameterName] = element.autofillValue;
    });
    div.dataset['token'] = `Bearer ${this.token}`;
    div.style.height = '80vh';
    this.formContainer.nativeElement.appendChild(div);
  }

  fetchAutoFillData() {
    if (!this.webFormInstanceGuid?.length && this.isChild) {
      this.loadFilloutForm(this.parentAutoFillData);
      return;
    }
    if (!this.webFormInstanceGuid && !this.isChild) return;
    this.dataService
      .getWebFormInstanceAutofill(this.webFormInstanceGuid)
      .subscribe({
        next: (response) => {
          this.loadFilloutForm(response);
        },
      });
  }
  onBack() {
    this.location.back();
  }
  openModal(): void {
    this.displayModal = true;
  }

  closeModal(): void {
    this.displayModal = false;
  }

  addValue(): void {
    if (this.autoFillValue) {
      const req: AutoFillRequest = {
        webFormInstanceId: this.webFormInstanceGuid,
        autofillValue: this.autoFillValue,
        webFormGuid: this.webformGuid,
      };
      this.adminDashboardService.addAutoFillRecord(req).subscribe({
        next: (data) => {
          this.toast.success('Record created successfully ', 'Success');
          // clear values
          this.autoFillValue = '';
          this.fetchAutoFillData();
          this.closeModal();
        },
        error: () => {
          this.toast.error('Error creating autofill', 'Error');

          this.autoFillValue = '';

          this.closeModal();
        },
      });
    } else {
      console.error('Both fields are required.');
    }
  }
  ngOnDestroy(): void {
    // Remove the event listener when the component is destroyed
    window.removeEventListener('message', this.handleMessageBound, false);
  }

  handleFormSubmissionMessage(event: MessageEvent): void {
    try {
      const data = JSON.parse(event.data);

      if (data.channel === 'form_channel' && data.state === 'submitted') {
        // this.store.dispatch(clearSelectedApplicationGuid());
        if(data.flowPublicIdentifier === "wPgxAxwks1us"){
          // here set the session 
          localStorage.setItem('appState', JSON.stringify({session:this.session}));
          localStorage.setItem('ifAppInfoFormRedirect', 'true');
        }
        else {
          setTimeout(() => {
            this.location.back();
          }, 4000);
        }
      }
    } catch (error) {
      console.error('Invalid message received:', error);
    }
  }
}
