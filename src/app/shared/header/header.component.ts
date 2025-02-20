import { CommonModule } from '@angular/common';
import { Component, Input, OnInit } from '@angular/core';
import { MatBadgeModule } from '@angular/material/badge';  // Import the MatBadgeModule
import { MatIconModule } from '@angular/material/icon';    // Import MatIconModule for icons
import { MatMenuModule } from '@angular/material/menu';  // Import MatMenuModule
import { MatButtonModule } from '@angular/material/button';  // Required for buttons used in the menu
import { NotificationDrawerComponent } from '../notification-drawer/notification-drawer.component';
import { RouterLink } from '@angular/router';
import { AuthService } from '@auth0/auth0-angular';
import { Store } from '@ngrx/store';
import { logout } from '../../core/session/session.actions';
import { OverlayPanelModule } from 'primeng/overlaypanel'
import { Observable } from 'rxjs';
import { selectUserAccessType, selectUserType } from '../../core/session/session.selectors';

@Component({
  selector: 'app-header',
  standalone: true,
  imports: [CommonModule, MatBadgeModule, MatIconModule, MatMenuModule, MatButtonModule, NotificationDrawerComponent, RouterLink, OverlayPanelModule],
  templateUrl: './header.component.html',
  styleUrls: ['./header.component.css']
})
export class HeaderComponent implements OnInit{
  activeLink = 'Home'; // State for tracking active link
  drawerOpen = false;  // State for tracking drawer
  userTypeFromSession:Observable<any>;
  userAccessTypeFromSession:Observable<any>;
  userType:string;
  userAccessType:string
  isDropdownOpen:boolean = false;
  constructor(public auth: AuthService, private store: Store) {}
  handleSetActiveLink(linkName: string) {
    this.activeLink = linkName;
  }

  ngOnInit(): void {
    this.userTypeFromSession = this.store.select(selectUserType);
    this.userAccessTypeFromSession = this.store.select(selectUserAccessType);
    this.userTypeFromSession.subscribe(userType => {
      this.userType = userType;
    });
    this.userAccessTypeFromSession.subscribe(userAccessType => {
      this.userAccessType = userAccessType;
      console.log("From header this is the accesType", this.userAccessType)
    });
  }

  toggleDrawer(open: boolean) {
    this.drawerOpen = open;
  }
  toggleDropdown(): void {
    this.isDropdownOpen = !this.isDropdownOpen;
  }
  anchorEl: HTMLElement | null = null;

  handleClick(event: MouseEvent) {
    this.anchorEl = event.currentTarget as HTMLElement;
  }

  handleClose() {
    this.anchorEl = null;
  }

  logout() {
    // Logout from Auth0
    this.store.dispatch(logout());
    this.auth.logout({ logoutParams: { returnTo: "https://arpitamazumdar-easyglobal.github.io/github-pages/" } });
  }

}
