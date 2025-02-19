import { ComponentFixture, TestBed } from '@angular/core/testing';

import { DocumentListingComponent } from './document-listing.component';

describe('DocumentListingComponent', () => {
  let component: DocumentListingComponent;
  let fixture: ComponentFixture<DocumentListingComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [DocumentListingComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(DocumentListingComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
