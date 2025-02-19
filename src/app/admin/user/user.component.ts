import { CommonModule } from '@angular/common';
import { Component, Input, OnInit } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { ActivatedRoute, Router } from '@angular/router';
import { AdminDashboardService } from '../../core/service/admin-dashboard.service';
import { ToastrService } from 'ngx-toastr';
import { HttpClientModule } from '@angular/common/http';

interface UserDetails {
  userGuid: string;
  userEmail: string;
  firstName: string;
  lastName: string;
  mobileNumber: string;
  tenantGuid: string;
  userTypeHeaderCode: string;
  userTypeValueCode: string;
}

@Component({
  selector: 'app-user',
  standalone: true,
  imports: [CommonModule, FormsModule, HttpClientModule],
  templateUrl: './user.component.html',
  styleUrl: './user.component.css',
  providers: [AdminDashboardService]
})
export class UserComponent implements OnInit {
  @Input() user: UserDetails;
  employerGuid: string;

  constructor(
    private route: ActivatedRoute,
    private router: Router,
    private adminDashboardService: AdminDashboardService,
    private toastr: ToastrService
  ) {}

  isUserEditing: boolean = false;

  ngOnInit(): void {
    this.employerGuid = this.route.snapshot.paramMap.get('id');
    this.isUserEditing = false;
  }

  enableUserEditing(): void {
    this.isUserEditing = true;
  }

  updateUser(): void {
    this.adminDashboardService.updateUser(this.user.userGuid, this.user).subscribe({
      next: (_) => {
        this.toastr.success('User is Successfully Updated', 'Success');
        this.isUserEditing = false;
        this.router.navigate([`/employer/${this.employerGuid}/users`]);
      },
      error: (error) => {
        this.toastr.error('User is not updated', error);
        console.error('Error updating User', error);
      },
    })
  }

  deleteUser(): void {
    var userEmailEntered = prompt("Do you really want to delete User?\nPlease enter User Email Id");
    if(userEmailEntered == null || userEmailEntered == "")
      return;
    if(userEmailEntered?.trim().localeCompare(this.user.userEmail)!==0){
      alert("Wrong Email Id entered");
      return;
    }
    this.adminDashboardService
      .deleteUser(this.user.userGuid)
      .subscribe({
        next: (_) => {
          this.toastr.success('User Successfully Deleted', 'Success');
          this.router.navigate([`/employer/${this.employerGuid}/users`]);
        },
        error: (error) => {
          this.toastr.error('User is not deleted', error);
          console.error('Error deleting User', error);
        },
      });
  }

  cancelEditing(): void {
    this.isUserEditing = false;
  }
}
