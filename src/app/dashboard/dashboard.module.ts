import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { DriverinfoComponent } from './driverinfo/driverinfo.component';
import { SidenavLeftOperationComponent } from './sidenav-left/sidenav-left-operation/sidenav-left-operation.component';




@NgModule({
  declarations: [DriverinfoComponent, SidenavLeftOperationComponent],
  imports: [
    CommonModule
  ]
})
export class DashboardModule { }
