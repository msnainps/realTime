import { Injectable } from '@angular/core';
import { SidenavLeftComponent } from '../dashboard/sidenav-left/sidenav-left.component';
import { DashboardComponent } from '../dashboard/dashboard.component';
import { FilterDialog } from '../header/filter/filter.dialog.component';





@Injectable({
  providedIn: 'root'
})
export class SharedService {

  public sidecmp :SidenavLeftComponent = null;
  public dashbrdCmpShared :DashboardComponent = null;
  public filterDialogCmpShared:FilterDialog = null;

  //Show loader if any action performed in Header Date;
  public headerDateAction = 0;
  constructor(
    
  ) { }

  callViewDetails(){
    
  }
}
