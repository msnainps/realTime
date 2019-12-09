import { Component, OnInit, AfterViewInit, Output, OnDestroy } from '@angular/core';
import { DashboardService } from './dashboard.service';
import { MapboxService } from '../mapbox/mapbox.service';
import { DriverinfoComponent } from './driverinfo/driverinfo.component';
import { MatDialog, MatDialogRef } from '@angular/material';
import { Subscription } from 'rxjs';
declare var mapboxgl: any;
declare var document: any;
sub: Subscription;
import { NgxSpinnerService } from "ngx-spinner";
import { config } from 'src/config/config';
import { formatDate } from '@angular/common';
import { Popup } from 'mapbox-gl';
import { $ } from 'protractor';
import { ToastrService } from 'ngx-toastr';




@Component({
  selector: 'app-dashboard',
  templateUrl: './dashboard.component.html',
  styleUrls: ['./dashboard.component.css']
})
export class DashboardComponent implements OnInit {



  driverInfoPopup = {};
  shipment_id: string;
  shipment_route_id: any;
  assignRouteToDriver: any = [];
  configSettings = new config();
  companyId = this.configSettings.env.company_id;
  wairehouseId = this.configSettings.env.wairehouse_id;
  email = this.configSettings.env.email;
  access_token = this.configSettings.env.icargo_access_token;


  constructor(private dashboardService: DashboardService, private mapbox: MapboxService, private dialog: MatDialog, private spinnerService: NgxSpinnerService
    , private toastr: ToastrService) {
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
          "icon-ignore-placement":true,
          "symbol-avoid-edges":true,
          "text-allow-overlap":true
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
          'text-offset': [0, 1.5],
          "text-allow-overlap":true,
          "icon-ignore-placement":true
        },
        paint: {
          'text-color': '#00ff00',
          'text-halo-color': '#fff',
          'text-halo-width': 2
        }
      });



      //Fit All Points to map
      var allCordinates = [];
      if (this.dashboardService.formatedData.data.features.length > 0 || this.dashboardService.formatedData.data.features.length != 'undefined') {
        for (var index1 in this.dashboardService.formatedData.data.features) {
          allCordinates.push(this.dashboardService.formatedData.data.features[index1].geometry.coordinates)
        }
      }

      //Show All drops by zoom on button click
      document.getElementById('zoomto').addEventListener('click', function () {

        var coordinates = allCordinates;

        var bounds = coordinates.reduce(function (bounds, coord) {
          return bounds.extend(coord);
        }, new mapboxgl.LngLatBounds(coordinates[0], coordinates[0]));

        document.mapCom.mapbox.map.fitBounds(bounds, {
          padding: 50
        });
    });


    //Show POPUP on clicks parcels
    this.mapbox.map.on('click', 'points', function (e) {
      var coordinates = e.features[0].geometry.coordinates.slice();
      var description = e.features[0].properties.description;
      while (Math.abs(e.lngLat.lng - coordinates[0]) > 180) {
        coordinates[0] += e.lngLat.lng > coordinates[0] ? 360 : -360;
      }

      document.mapCom.shipment_id = e.features[0].properties.shipment_id;
      document.mapCom.shipment_route_id = e.features[0].properties.shipment_route_id;

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
      document.mapCom.sub = document.mapCom.dashboardService.getDriverParcelInfo(driver_id).subscribe(quote => {
        document.mapCom.driverInfoPopup['parcelData'] = quote;
      });


      console.log(document.mapCom.driverInfoPopup);

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
    var month = d.getMonth() + 1;
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

assignDriver(driverid: number) {

  document.mapCom.assignRouteToDriverData =
    {
      'endPointUrl': 'assignUnassignRoute',
      'route_id': '' + document.mapCom.shipment_route_id,
      'driver_id': '' + driverid,
      'company_id': '' + document.mapCom.companyId,
      'warehouse_id': '' + document.mapCom.wairehouseId,
      'email': document.mapCom.email,
      'access_token': document.mapCom.access_token,
      'start_time': formatDate(new Date(), 'dd-MM-yyyy hh:mm:ss a', 'en-US', '+0530')
    }

  //Load Spinner
  document.mapCom.spinnerService.show("driverAssign", {
    type: "line-scale-party",
    size: "large",
    color: "white"
  });
  document.mapCom.dashboardService.assignDriverToRoute(document.mapCom.assignRouteToDriverData).subscribe((response) => {
    //Remove Map Box pop-up
    document.querySelector(".mapboxgl-popup").remove();
    document.mapCom.spinnerService.hide("driverAssign");

    document.mapCom.dashboardService.loadDropOnMapsEmit();//For Realtime Data

    var myStr = response;
    var strArray = myStr.split(".");
    var decodeBAse64 = JSON.parse(atob(strArray[1]));
    
    if (decodeBAse64.status == 'error') {
      this.toastr.error(decodeBAse64.message, '', {
        closeButton: true, positionClass: 'toast-top-right', timeOut: 40000
      });
    } else if(decodeBAse64.status == 'success'){
      this.toastr.success(decodeBAse64.message, '', {
        closeButton: true, positionClass: 'toast-top-right', timeOut: 4000
      });
    }
  }, error => {
    console.log(error);
  })

}
}


