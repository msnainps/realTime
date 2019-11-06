import { Component, OnInit, Output } from '@angular/core';
import { DashboardService } from './dashboard.service';


@Component({
  selector: 'app-dashboard',
  templateUrl: './dashboard.component.html',
  styleUrls: ['./dashboard.component.css']
})
export class DashboardComponent implements OnInit {

  //Google Map Loading Defualt Lat long (UK)
  lat = 51.75343480000000000000;
  lng = -1.27945500000000000000;

  constructor(private dashboardService:DashboardService) {
   }

  ngOnInit() {
    this.dashboardService.loadDropOnMapsListen();
  }
  status: boolean = false;
  status2: boolean = false;
  addClass() {
    this.status = !this.status;
  }

  addClass2() {
    this.status2 = !this.status2;
  }

  
}


