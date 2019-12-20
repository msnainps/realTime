import { Component, OnInit, ViewEncapsulation } from '@angular/core';

import { HeaderService } from './header.service';
import { Header } from './header.model';
import { config } from 'src/config/config';
import { DateTimeAdapter } from 'ng-pick-datetime';







@Component({
  selector: 'app-header',
  templateUrl: './header.component.html',
  styleUrls: ['./header.component.css'],
  encapsulation: ViewEncapsulation.None,
})
export class HeaderComponent implements OnInit {

  configSettings = new config();
  //SHow default date in angular
  shipmentCurrentDate = new Date();
  header:Header= new Header();
  toaserMsg;
  
  constructor(private headerService:HeaderService,dateTimeAdapter: DateTimeAdapter<any>) {
    if (this.configSettings.env.country_code.toLowerCase() == 'us' || this.configSettings.env.country_code.toLowerCase() == 'usa') {
      dateTimeAdapter.setLocale('us');
    } else {
      dateTimeAdapter.setLocale('en-IN');
    }
   }

  
  ngOnInit() {
    //this.headerService.getHeaderDataListen(this);
  }
  isShown:Boolean=false;
  toggleShow() {

  //this.isShown = ! this.isShown;
    
  }

  redirectTOHome(){
    window.open(this.configSettings.env.icargo_url, "_blank");
  }

  

}
