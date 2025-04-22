import { ComponentFixture, TestBed } from '@angular/core/testing';

import { AjoutercongeComponent } from './ajouterconge.component';

describe('AjoutercongeComponent', () => {
  let component: AjoutercongeComponent;
  let fixture: ComponentFixture<AjoutercongeComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [AjoutercongeComponent]
    })
    .compileComponents();
    
    fixture = TestBed.createComponent(AjoutercongeComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
