import { ComponentFixture, TestBed } from '@angular/core/testing';

import { WebformsComponent } from './webforms.component';

describe('WebformsComponent', () => {
  let component: WebformsComponent;
  let fixture: ComponentFixture<WebformsComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [WebformsComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(WebformsComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
