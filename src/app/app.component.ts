import { Component } from '@angular/core';
import { config } from 'src/config/config';



@Component({
  selector: 'app-root',
  templateUrl: './app.component.html',
  styleUrls: ['./app.component.css']
})
export class AppComponent {
  configsettings = new config;
  title = 'instaDash';
  logout = false;
  constructor() {
    if (!this.configsettings.env.icargo_access_token || !this.configsettings.env.company_id) {
      this.logout = true;
    }
  }

  closeCurrentPage(){
    window.open(this.configsettings.env.icargo_url, "_blank");
  }
}

