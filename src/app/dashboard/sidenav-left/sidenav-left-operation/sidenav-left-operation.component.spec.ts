import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { SidenavLeftOperationComponent } from './sidenav-left-operation.component';

describe('SidenavLeftOperationComponent', () => {
  let component: SidenavLeftOperationComponent;
  let fixture: ComponentFixture<SidenavLeftOperationComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ SidenavLeftOperationComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(SidenavLeftOperationComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
