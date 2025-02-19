import { Component, Input } from '@angular/core';

@Component({
  selector: 'app-info-message',
  standalone: true,
  imports: [],
  templateUrl: './info-message.component.html',
  styleUrl: './info-message.component.css'
})
export class InfoMessageComponent {
  @Input() imageUrl?: string; // Optional image URL
  @Input() heading?: string;  // Optional heading
  @Input() subheading?: string; // Optional subheading
}
