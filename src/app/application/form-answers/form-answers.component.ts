import { CommonModule, Location } from '@angular/common';
import { Component, OnInit } from '@angular/core';
import { DataService } from '../../core/service/data.service';
import { ActivatedRoute } from '@angular/router';

@Component({
  selector: 'app-form-answers',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './form-answers.component.html',
  styleUrl: './form-answers.component.css'
})
export class FormAnswersComponent implements OnInit {
  webFormInstanceGuid:string = "";
  loading = true;
  answers = [];

  constructor(private dataService: DataService, private route: ActivatedRoute, private location: Location) {}
  onBack() {
    this.location.back();
  }
  ngOnInit(): void {
    // Get the parameter from the route
    this.webFormInstanceGuid = this.route.snapshot.paramMap.get('webFormInstanceGuid');
    this.dataService.getAnswersForFilledForm(this.webFormInstanceGuid).subscribe({next:(data) => {
      this.answers = data;
      this.loading = false;
    }, error:(error) => console.log("error fetching answers ", error)});
  }
  isArray(value: any): boolean {
    return Array.isArray(value);
  }
  getKeys(obj: any): string[] {
    return Object.keys(obj);
  }
  isObject(value: any): boolean {
    return (
      typeof value === 'object' && // Ensure it's an object
      value !== null && // Exclude `null`
      !Array.isArray(value) && // Exclude arrays
      Object.prototype.toString.call(value) === '[object Object]' && // Ensure it's a plain object
      Object.keys(value).length > 1 // Check if it has more than one key
    );
}
}
