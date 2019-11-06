import { TestBed } from '@angular/core/testing';

import { SidenavLeftService } from './sidenav-left.service';

describe('SidenavLeftService', () => {
  beforeEach(() => TestBed.configureTestingModule({}));

  it('should be created', () => {
    const service: SidenavLeftService = TestBed.get(SidenavLeftService);
    expect(service).toBeTruthy();
  });
});
