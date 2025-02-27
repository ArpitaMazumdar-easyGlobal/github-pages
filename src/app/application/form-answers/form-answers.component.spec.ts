import { ComponentFixture, TestBed } from '@angular/core/testing';

import { FormAnswersComponent } from './form-answers.component';

describe('FormAnswersComponent', () => {
  let component: FormAnswersComponent;
  let fixture: ComponentFixture<FormAnswersComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [FormAnswersComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(FormAnswersComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
