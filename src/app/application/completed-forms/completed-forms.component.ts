import { CommonModule } from '@angular/common';
import { Component, Input, OnChanges, OnInit, SimpleChanges } from '@angular/core';
import { Router } from '@angular/router';

@Component({
  selector: 'app-completed-forms',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './completed-forms.component.html',
  styleUrl: './completed-forms.component.css'
})
export class CompletedFormsComponent implements OnInit, OnChanges{
  @Input() forms:any[] = []
  @Input() applicationGuid:string =""
  @Input() currentappinstGuid:string =""
  // or get these form the url itself simple 

  constructor(private router : Router) {
    // Initialization code here
  }
  ngOnChanges(changes: SimpleChanges):void{
    if (changes['forms'] && changes['forms'].currentValue){
    }
  }
  ngOnInit(): void {
    
  }
  onFormClick(form ){
    if(!form) return;
    this.router.navigate([
      `form-manager/${this.applicationGuid}/${this.currentappinstGuid}/form-answers/${form.webformInstanceGuid}`,
    ]);
  }
}
