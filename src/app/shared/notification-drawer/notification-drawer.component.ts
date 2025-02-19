// notification-drawer.component.ts
import { Component, Input, Output, EventEmitter } from '@angular/core';
import { MatSidenavModule } from '@angular/material/sidenav';
import { MatDividerModule } from '@angular/material/divider';
import { MatListModule } from '@angular/material/list';
import { MatIconModule } from '@angular/material/icon';
import { CommonModule } from '@angular/common';

@Component({
  selector: 'app-notification-drawer',
  standalone: true,
  imports: [
    CommonModule,
    MatSidenavModule,
    MatDividerModule,
    MatListModule,
    MatIconModule
  ],
  templateUrl: './notification-drawer.component.html',
  styleUrls: ['./notification-drawer.component.css']
})
export class NotificationDrawerComponent {
  @Input() open: boolean = false;
  @Output() toggleDrawer = new EventEmitter<boolean>();

  closeDrawer() {
    this.toggleDrawer.emit(false);
  }
}
