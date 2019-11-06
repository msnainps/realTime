import { BrowserModule } from '@angular/platform-browser';
import { NgModule } from '@angular/core';
import {FormsModule, ReactiveFormsModule} from '@angular/forms';
import { AppRoutingModule } from './app-routing.module';
import { AppComponent } from './app.component';
import { HeaderComponent } from './header/header.component';
import { MaterialDesignModule } from './material-design/material-design.module';
import { DashboardComponent } from './dashboard/dashboard.component';
import { SidenavRoutesComponent } from './dashboard/sidenav-routes/sidenav-routes.component';


@NgModule({
  declarations: [
    AppComponent,
    HeaderComponent,
    DashboardComponent,
    SidenavRoutesComponent,

  ],
  imports: [
    AppRoutingModule,
    FormsModule,
    ReactiveFormsModule,
    MaterialDesignModule
  ],
  providers: [],
  bootstrap: [AppComponent]
})
export class AppModule { }
