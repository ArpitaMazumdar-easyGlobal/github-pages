import { ComponentFixture, TestBed } from '@angular/core/testing';

import { CompletedFormsComponent } from './completed-forms.component';

describe('CompletedFormsComponent', () => {
  let component: CompletedFormsComponent;
  let fixture: ComponentFixture<CompletedFormsComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [CompletedFormsComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(CompletedFormsComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
