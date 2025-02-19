import { Component, OnInit } from '@angular/core';
import {
  AppState,
  AuthorizationParams,
  AuthService,
} from '@auth0/auth0-angular';
import { ActivatedRoute, Router } from '@angular/router';
import { login } from '../../core/session/session.actions';
import { Store } from '@ngrx/store';
import { AppConfigService } from '../../app-config.service';
import { ApplicationService } from '../../core/service/application.service';
import { firstValueFrom, take } from 'rxjs';
import { UserProfile } from '../../../util/types';
import { LoadingComponent } from '../../shared/loading/loading.component';

@Component({
  selector: 'app-login',
  standalone: true,
  imports: [LoadingComponent],
  templateUrl: './login.component.html',
  styleUrls: ['./login.component.css'],
})
export class LoginComponent implements OnInit {
  constructor(
    public auth: AuthService,
    public router: Router,
    private store: Store,
    private route: ActivatedRoute,
    private config: AppConfigService,
    private appService: ApplicationService
  ) {}

  email: string = '';
  appGuid: string = '';
  firstName: string = '';
  lastName: string = '';
  mobileNumber: string = '';
  type: string = '';
  employerGuid: string = '';
  countryOfNationality: string = '';

  async ngOnInit(): Promise<void> {
    try {
      const isAuthenticated = await firstValueFrom(this.auth.isAuthenticated$); // convert observale to promise  firstvaluefrom
      if (isAuthenticated) {
        // Get the token and user info first
        const token = await firstValueFrom(this.auth.getAccessTokenSilently());
        const user = await firstValueFrom(this.auth.user$);

        await this.createUser(token);
        const appState = await this.getAppGuidWithTimeout();
        let { type, appGuid } = appState?.customData;

        const userProfile = await this.getUserProfile(token);
        type = userProfile.userTypeValueCode;
        // Store login info
        this.store.dispatch(
          login({
            userId: user.sub.split('|')[1],
            token: token,
            userType: type,
            userAccessType: userProfile?.accessType,
            employerName:userProfile?.employerName,
            employerSchedulingFormId:userProfile?.employerSchedulingFormId
          })
        );

        switch (type) {
          case 'APPLICANT':
            if (appGuid) await this.createApplicationInstance(appGuid, token);
            this.router.navigate(['/myapplication']);
            break;
          case 'EMPLOYER':
            if (appGuid) await this.createApplicationInstance(appGuid, token);
            if (userProfile.accessType === 'ADMIN')
              this.router.navigate(['/employerDashboard']);
            else this.router.navigate(['/manageCandidates']);
            break;
          case 'ADMIN':
            this.router.navigate(['/admin']);
            break;
          default:
            this.router.navigate(['/home']);
        }
      } else {
        await this.initiateLogin();
      }
    } catch (error) {
      console.error('Login flow error:', error);
      this.router.navigate(['/myapplication']);
    }
  }

  private async getAppGuidWithTimeout(): Promise<AppState | null> {
    try {
      const appStatePromise = new Promise<any>((resolve) => {
        this.auth.appState$.pipe(take(1)).subscribe({
          next: (state) => resolve(state),
          error: () => resolve(null),
        });

        setTimeout(() => resolve(null), 1000); // Timeout after 1 second
      });

      const appState = await appStatePromise;
      return appState || { customData: { type: null, appGuid: null } };
    } catch {
      return { customData: { type: null, appGuid: null } };
    }
  }

  private async initiateLogin(): Promise<void> {
    this.email = this.route.snapshot.queryParamMap.get('email') || '';
    this.firstName = this.route.snapshot.queryParamMap.get('firstName') || '';
    this.lastName = this.route.snapshot.queryParamMap.get('lastName') || '';
    this.mobileNumber =
      this.route.snapshot.queryParamMap.get('mobileNumber') || '';
    this.type = this.route.snapshot.queryParamMap.get('type') || '';
    this.employerGuid =
      this.route.snapshot.queryParamMap.get('employerGuid') || '';
    this.appGuid = this.route.snapshot.queryParamMap.get('appGuid') || '';
    this.countryOfNationality =
      this.route.snapshot.queryParamMap
        .get('countryOfNationality')?.toLocaleUpperCase() || '';

    const tenantGuid = await firstValueFrom(this.config.tenantGuidSubject$);
    let authorizationParams: AuthorizationParams = {
      connection: 'email',
      login_hint: this.email,
      tenantGuid: tenantGuid,
      userEmail: this.email,
      firstName: this.firstName,
      lastName: this.lastName,
      mobileNumber: this.mobileNumber,
      type: this.type,
      countryOfNationality: this.countryOfNationality,
    };
    if (this.type === 'EMPLOYER')
      authorizationParams.employerGuid = this.employerGuid;

    await this.auth.loginWithRedirect({
      appState: {
        customData: { appGuid: this.appGuid, type: this.type }, // auth0 after login provides in the appState$ observable
      },
      authorizationParams,
    });
  }

  private async createApplicationInstance(
    appGuid: string,
    token: string
  ): Promise<void> {
    if (!appGuid || !token) return;
    try {
      const tenantGuid = await firstValueFrom(this.config.tenantGuidSubject$);
      await firstValueFrom(
        this.appService.createApplicationInstance(
          { ApplicationGuid: appGuid, TenantGuid: tenantGuid },
          token
        )
      );
    } catch (error) {
      console.error('Error creating application instance:', error);
    }
  }
  private async createUser(token: string): Promise<void> {
    // hit api to create user
    try {
      await firstValueFrom(this.appService.createUser(token));
    } catch (error) {
      console.log('Error while creating the user', error);
    }
  }
  private async getUserProfile(token: string): Promise<UserProfile> {
    try {
      return await firstValueFrom(this.appService.getUserProfile(token));
    } catch (error) {
      console.log('Error while creating the user', error);
    }
  }
}
