import { Component, OnInit, Output } from '@angular/core';
import { DashboardService } from './dashboard.service';
import { MapMouseEvent } from 'mapbox-gl';

@Component({
  selector: 'app-dashboard',
  templateUrl: './dashboard.component.html',
  styleUrls: ['./dashboard.component.css']
})
export class DashboardComponent implements OnInit {

  //Google Map Loading Defualt Lat long (UK)
  lat = 51.75343480000000000000;
  lng = -1.27945500000000000000;
  mapBoxStyle = "mapbox://styles/instadispatch/ck2u7n91p3kvq1cp30yrc0uz5";
  zoom = 11.5;

  //points: GeoJSON.FeatureCollection<GeoJSON.Point>;
  selectedPoint: GeoJSON.Feature<GeoJSON.Point> | null;
  cursorStyle: string;

  constructor(private dashboardService: DashboardService) {

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



  alert(message: string) {
    alert(message);
  }

  onClick(evt: MapMouseEvent) {
    this.selectedPoint = null;
    //this.ChangeDetectorRef.detectChanges();
    this.selectedPoint = (<any>evt).features[0];
  }

}


