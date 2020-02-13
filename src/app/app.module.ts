import { BrowserModule } from '@angular/platform-browser';
import { NgModule } from '@angular/core';
import {FormsModule, ReactiveFormsModule} from '@angular/forms';
import { AppRoutingModule } from './app-routing.module';
import { AppComponent } from './app.component';
import { HeaderComponent } from './header/header.component';
import { MaterialDesignModule } from './material-design/material-design.module';
import { DashboardComponent } from './dashboard/dashboard.component';
import { AgmCoreModule } from '@agm/core';
import { config } from 'src/config/config';
import { SidenavLeftComponent } from './dashboard/sidenav-left/sidenav-left.component';
import { SidenavRightComponent } from './dashboard/sidenav-right/sidenav-right.component';
// import { NgxMapboxGLModule } from 'ngx-mapbox-gl';
import { FilterComponent } from './header/filter/filter.component';
import { FilterDialog } from './header/filter/filter.dialog.component';
import { MatDialogModule,MatTabsModule  } from '@angular/material';
import { DriverinfoComponent } from './dashboard/driverinfo/driverinfo.component';
import { NgxSpinnerModule } from "ngx-spinner"; 
import { HttpClientModule } from '@angular/common/http';
import { ToastrModule } from 'ngx-toastr';
import { SidenavLeftOperationComponent } from './dashboard/sidenav-left/sidenav-left-operation/sidenav-left-operation.component';
import {AgGridModule} from "@ag-grid-community/angular";
import { OwlDateTimeModule, OwlNativeDateTimeModule } from 'ng-pick-datetime';
import {MatSelectModule} from '@angular/material/select';



@NgModule({
  
  declarations: [
    AppComponent,
    HeaderComponent,
    DashboardComponent,
    SidenavLeftComponent,
    SidenavRightComponent,
    FilterComponent,
    FilterDialog,
    DriverinfoComponent,
    SidenavLeftOperationComponent,
  ],
  imports: [
    AppRoutingModule,
    FormsModule,
    ReactiveFormsModule,
    MaterialDesignModule,
    AgmCoreModule.forRoot({
      apiKey: new config().env.google_api_key
    }),
    MatDialogModule,
    NgxSpinnerModule,
    HttpClientModule,
    ToastrModule.forRoot(),
    AgGridModule.withComponents([]),
    OwlDateTimeModule,
    OwlNativeDateTimeModule,
    MatTabsModule,
    MatSelectModule
  ],
  providers: [],
  bootstrap: [AppComponent],
  entryComponents: [FilterDialog,DriverinfoComponent],
})
export class AppModule { }
