import { Component, OnInit } from "@angular/core";
import { CommonModule } from "@angular/common";
import { AuthService } from "@auth0/auth0-angular";
import { ApplicationService } from "../../core/service/application.service";
import { HttpClientModule } from '@angular/common/http';
import { Router } from "@angular/router";
import { ApplicationInstance } from "../../../util/types";



@Component({
  selector: "app-my-application",
  standalone: true,
  imports: [CommonModule, HttpClientModule],
  templateUrl: "./my-application.component.html",
  styleUrls: ["./my-application.component.css"], // Fixed to 'styleUrls'
  providers: [AuthService, ApplicationService]
})
export class MyApplicationComponent implements OnInit {
  applicationInstances: ApplicationInstance[] = []; // Initialize as an empty array
  userId: string;

  constructor(
    private authService: AuthService,
    private applicationService: ApplicationService,
    private router: Router
  ) {}

  ngOnInit(): void {
    // Get the userId
    this.authService.isAuthenticated$.subscribe(isAuthenticated => {
      if (isAuthenticated) {
        this.authService.user$.subscribe(user => {
          this.userId = user.sub.split("|")[1];
          // Fetching all the application instances for the logged-in user
          this.applicationService.getAllApplicationInstanceForUser()
          .subscribe(
            (data) => {
              this.applicationInstances = data.applications; 
              this.applicationInstances.forEach(inst => {
                inst.createdAtFormatted = this.formatDate(inst.createdAt);
              });
              if(this.applicationInstances.length == 1){
                this.takeToApplicationDetailPage(this.applicationInstances[0].applicationGuid, this.applicationInstances[0].applicationInstanceGuid)
              }
            },
            (error) => {
              console.log("Error occurred while fetching instances: ", error);
            }
          );
        });
      }
    });
  }

  private takeToApplicationDetailPage(appGuid:string, appInstanceGuid){
    this.router.navigate(['/form-manager', appGuid, appInstanceGuid], {
      queryParams: { showFullContent:true},
    });
  }
    // Method to format the createdAt date
  private formatDate(date: Date | number): string {
    const now = new Date();
    const createdAtDate = new Date(date);
    
    const diffTime = Math.abs(now.getTime() - createdAtDate.getTime());
    const diffDays = Math.floor(diffTime / (1000 * 60 * 60 * 24));
    
    if (diffDays === 0) {
      return 'Today';
    } else if (diffDays === 1) {
      return 'Yesterday';
    } else {
      return `${diffDays} day(s) ago`;
    }
  }
}
