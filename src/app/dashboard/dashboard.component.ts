import { Component, OnInit, AfterViewInit, Output,OnDestroy } from '@angular/core';
import { DashboardService } from './dashboard.service';
import { MapboxService } from '../mapbox/mapbox.service';
import { DriverinfoComponent } from './driverinfo/driverinfo.component';
import { MatDialog, MatDialogRef } from '@angular/material';
import { Subscription } from 'rxjs';
declare var mapboxgl: any;
declare var document: any;
sub: Subscription;



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
  zoom = 8;
  driverInfoPopup = {};



  constructor(private dashboardService: DashboardService, private mapbox: MapboxService, private dialog: MatDialog) {
    document.mapCom = this;
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

  ngAfterViewInit() {

    this.mapbox.initMap();
    this.mapbox.map.on("load", () => {

      //Drops
      this.mapbox.map.addSource("points", this.dashboardService.formatedData);
      this.mapbox.map.addLayer({
        "id": "points",
        "type": "symbol",
        "source": "points",
        "layout": {
          'icon-image': '{icon}',
          'icon-allow-overlap': true,
          "text-field": '{execution_order}',
        }
      });

      //Driver
      this.mapbox.map.addSource("drivers", this.dashboardService.formatedDataDriver);
      this.mapbox.map.addLayer({
        "id": "drivers",
        "type": "symbol",
        "source": "drivers",
        "layout": {
          'icon-image': '{icon}',
          'icon-allow-overlap': true,
           "text-field": '{name}',
          'text-offset': [0, 1.5]
        },
        paint: {
          'text-color': '#00ff00',
          'text-halo-color': '#fff',
          'text-halo-width': 2
        }
      });


      //Show POPUP on clicks parcels
      this.mapbox.map.on('click', 'points', function (e) {
        var coordinates = e.features[0].geometry.coordinates.slice();
        var description = e.features[0].properties.description;
        while (Math.abs(e.lngLat.lng - coordinates[0]) > 180) {
          coordinates[0] += e.lngLat.lng > coordinates[0] ? 360 : -360;
        }

        new mapboxgl.Popup()
          .setLngLat(coordinates)
          .setHTML(description)
          .addTo(this);
      });

      //Show POPUP on clicks Drivers
      this.mapbox.map.on('click', 'drivers', function (e) {
        var coordinates = e.features[0].geometry.coordinates.slice();
        var description = e.features[0].properties.description;
        var driver_id = e.features[0].properties.driver_id;
        
        document.mapCom.driverInfoPopup['name'] = e.features[0].properties.name;
        document.mapCom.driverInfoPopup['last_sync_time'] = document.mapCom.getFullDateTime(e.features[0].properties.last_sync_time);
        document.mapCom.driverInfoPopup['battery_charge'] = e.features[0].properties.battery_status;
        
       
        //document.mapCom.driverInfoPopup['parcelData'] = document.mapCom.dashboardService.getDriverParcelInfo(driver_id);
        document.mapCom.sub = document.mapCom.dashboardService.getDriverParcelInfo(521).subscribe(quote => {
           document.mapCom.driverInfoPopup['parcelData'] = quote;
        });
        

        console.log(document.mapCom.driverInfoPopup);
        //console.log(document.mapCom.driverInfoPopup['parcelData']);
        
        document.mapCom.dialog.open(DriverinfoComponent, {
          data: { 'info': document.mapCom.driverInfoPopup }
        });

      });

    });

  }

  getFullDateTime(timeString) {
    if (timeString) {
      var d = new Date(timeString);
      var h = d.getHours();
      var m = d.getMinutes();
      var s = d.getSeconds();
      var fullTime = ((h < 10) ? '0' + h : h) + ":" + ((m < 10) ? '0' + m : m) + ":" + ((s < 10) ? '0' + s : s);
      var date = d.getDate();
      var month = d.getMonth()+1;
      var year = d.getFullYear();
      var fullDate = ((date < 10) ? '0' + date : date) + "-" + ((month < 10) ? '0' + month : month) + "-" + year;
      return fullDate + ' ' + fullTime;
    } else {
      return '';
    }
  }

  ngOnDestroy() {
    document.mapCom.sub.unsubscribe();
  }
}


