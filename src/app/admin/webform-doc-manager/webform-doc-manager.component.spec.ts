import { ComponentFixture, TestBed } from '@angular/core/testing';

import { WebformDocumentManagerComponent } from './webform-doc-manager.component';

describe('WebformDocumentManagerComponent', () => {
  let component: WebformDocumentManagerComponent;
  let fixture: ComponentFixture<WebformDocumentManagerComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [WebformDocumentManagerComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(WebformDocumentManagerComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
