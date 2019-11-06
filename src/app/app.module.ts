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





@NgModule({
  
  declarations: [
    AppComponent,
    HeaderComponent,
    DashboardComponent,
    SidenavLeftComponent,
    SidenavRightComponent
  ],
  imports: [
    AppRoutingModule,
    FormsModule,
    ReactiveFormsModule,
    MaterialDesignModule,
    AgmCoreModule.forRoot({
      apiKey: new config().env.google_api_key
    }),
  ],
  providers: [],
  bootstrap: [AppComponent]
})
export class AppModule { }
