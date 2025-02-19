import { Component, OnInit, OnDestroy } from '@angular/core';
import { Subject } from 'rxjs';
import { ApplicationService } from '../../core/service/application.service';
import { AuthService } from '@auth0/auth0-angular';
import { ApplicationInstanceRequest } from '../../core/service/application.service';
import { CommonModule } from '@angular/common';
import { HttpClientModule } from '@angular/common/http';
import { ToastrService } from 'ngx-toastr';
import { ActivatedRoute, Router } from '@angular/router';

@Component({
  selector: 'my-home',
  standalone: true,
  imports: [CommonModule, HttpClientModule],
  templateUrl: './home.component.html',
  styleUrls: ['./home.component.css'],
  providers: [ApplicationService, AuthService],
})
export class HomeComponent implements OnInit, OnDestroy {
  private unsubscribe$ = new Subject<void>();
  userId: string;
  error: any;
  forms: any[] = [];
  applications: any[] = [];
  applicationName: string;
  loading: boolean = true;

  constructor(
    private applicationService: ApplicationService,
    private authService: AuthService,
    private toastr: ToastrService,
    private router: Router,
    private route: ActivatedRoute
  ) {}

  ngOnInit(): void {
    this.loading = true;
    // fetch all the applications
    this.applicationService.getAllApplications().subscribe({
      next: (data) => {
        // fetching all applications
        this.applications = data.applications;
        this.route.paramMap.subscribe((params) => {
          this.applicationName = params.get('application');
          if (this.applicationName == 'Caregiver') {
            const careGiverProgramGuid =
              this.applications.find((app) =>
                app.applicationName.includes('Caregiver')
              ) ?? null;
            if (careGiverProgramGuid != null)
              this.onClick(careGiverProgramGuid.applicationGuid);
          } else {
            this.loading = false;
          }
        });
      },
      error: (error) => {
        console.log(error);
        this.loading = false;
      },
    });

    // get the userId
    this.authService.isAuthenticated$.subscribe((isAuthenticated) => {
      if (isAuthenticated) {
        this.authService.user$.subscribe((user) => {
          this.userId = user.sub.split('|')[1];
        });
      }
    });
  }
  onClick(applicationGuid: string) {
    const app = this.applications.find(
      (app) => app.applicationGuid === applicationGuid
    );
    // const request: ApplicationInstanceRequest = {
    //   ApplicationGuid: app.applicationGuid,
    // };
    // this.applicationService.createApplicationInstance(request).subscribe(
    //   (data) =>
    //     {
    //       this.toastr.success("Instance Created Successfully");
    //       this.loading = false;
    //       this.router.navigate(['/form-manager', applicationGuid]);

    //    },
    //   (error) => { this.toastr.error("Error", error) })
  }
  ngOnDestroy(): void {
    this.unsubscribe$.next();
    this.unsubscribe$.complete();
  }
}
