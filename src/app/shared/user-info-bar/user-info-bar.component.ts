import { Component } from '@angular/core';
import {AuthService} from "@auth0/auth0-angular";

@Component({
  selector: 'app-user-info-bar',
  standalone: true,
  imports: [],
  templateUrl: './user-info-bar.component.html',
  styleUrls: ['./user-info-bar.component.css']
})
export class UserInfoBarComponent {
  constructor(public auth: AuthService) {}
  selectedApplication = {
    number: '#372156531',
    countryCode: 'ca', // Default country code for Canada
  };

  handleSelect(number: string, countryCode: string): void {
    this.selectedApplication = { number, countryCode };
  }
}
