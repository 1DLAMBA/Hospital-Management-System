import { ComponentFixture, TestBed } from '@angular/core/testing';

import { NursePanelComponent } from './nurse-panel.component';

describe('NursePanelComponent', () => {
  let component: NursePanelComponent;
  let fixture: ComponentFixture<NursePanelComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [NursePanelComponent]
    })
    .compileComponents();
    
    fixture = TestBed.createComponent(NursePanelComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
