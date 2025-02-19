import { Component, OnInit, OnDestroy } from '@angular/core';
import { Router, RouterOutlet } from '@angular/router';
import { HeaderComponent } from './shared/header/header.component';
import { AuthService } from '@auth0/auth0-angular';
import { CommonModule } from '@angular/common';
import { environment } from '../environments/environment.development';
import { MatMenuModule } from '@angular/material/menu';
import { MatDialogModule } from '@angular/material/dialog';
import { FontAwesomeModule } from '@fortawesome/angular-fontawesome';
import { ReactiveFormsModule, FormsModule } from '@angular/forms';
import { DialogModule } from 'primeng/dialog';
import { FileUploadModule } from 'primeng/fileupload';
import { ButtonModule } from 'primeng/button';
import { TabViewModule } from 'primeng/tabview';
import { OverlayPanelModule } from 'primeng/overlaypanel';
import { InputTextModule } from 'primeng/inputtext';
import { CalendarModule } from 'primeng/calendar';
import { NgSelectModule } from '@ng-select/ng-select';
import { AvatarModule } from 'primeng/avatar';
import { Store } from '@ngrx/store';

declare function renderVisaGenieWidget(containerId: string, apikey:string): void;
@Component({
  selector: 'app-root',
  standalone: true,
  imports: [RouterOutlet, HeaderComponent, CommonModule,
    MatMenuModule,
    MatDialogModule,
    FontAwesomeModule,
    ReactiveFormsModule,
    FormsModule,
    DialogModule,
    FileUploadModule,
    ButtonModule,
    TabViewModule,
    OverlayPanelModule,
    InputTextModule,
    AvatarModule,
    CalendarModule,
    NgSelectModule,],
  templateUrl: './app.component.html',
  styleUrl: './app.component.css'
})
export class AppComponent implements OnInit, OnDestroy {
  isAuthenticated: boolean = false;

  constructor(private auth: AuthService, private router: Router, private store: Store) {
    // Listen to the beforeunload event
    window.addEventListener('beforeunload', this.handleBeforeUnload);
  }

  ngOnInit(): void {
    this.auth.isAuthenticated$.subscribe(authStatus => {
      this.isAuthenticated = authStatus; // Update isAuthenticated based on the user's status
      const latestUrl = localStorage.getItem('latestUrl');
      localStorage.removeItem('latestUrl');
      if(this.isAuthenticated){
        const relativeUrl = new URL(latestUrl).pathname + new URL(latestUrl).search;
        this.router.navigateByUrl(relativeUrl);
      }
    });
  }
  ngAfterViewInit() :void{
    renderVisaGenieWidget('visa-genie-widget',environment.visagenieWidgetApiKey);
  }
  handleBeforeUnload = () => {
    this.store.dispatch({ type: 'APP_REFRESH' });
  };

  ngOnDestroy() {
    // Cleanup event listener
    window.removeEventListener('beforeunload', this.handleBeforeUnload);
  }
}
