import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { SidenavRoutesComponent } from './sidenav-routes.component';

describe('SidenavRoutesComponent', () => {
  let component: SidenavRoutesComponent;
  let fixture: ComponentFixture<SidenavRoutesComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ SidenavRoutesComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(SidenavRoutesComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
