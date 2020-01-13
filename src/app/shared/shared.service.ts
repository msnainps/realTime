import { Injectable } from '@angular/core';
import { SidenavLeftComponent } from '../dashboard/sidenav-left/sidenav-left.component';


@Injectable({
  providedIn: 'root'
})
export class SharedService {

  private sidecmp :SidenavLeftComponent = null;
  constructor(
    
  ) { }

  callViewDetails(){
    
  }
}
