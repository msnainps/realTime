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
import { SidenavLeftComponent } from './sidenav-left/sidenav-left.component';




export class shipmentInfo {
  ticket: string;
  customerName: string;
  address: string;
  customerReference: string;
  jobType: string;
  driverName: string;
  driverList: Array<any>;
  assigned_driver: any;
  shipment_route_id: any
}

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
  showHideModal = 'block';

  shipmentInfo = new shipmentInfo();
  loadIdentity: any;
  sideNavLeft:SidenavLeftComponent = null;




  constructor(
    private dashboardService: DashboardService, 
    private mapbox: MapboxService, 
    private dialog: MatDialog, 
    private spinnerService: NgxSpinnerService,
    private toastr: ToastrService
    ) {
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
    this.makeMapReady();
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

    //if Shipment Route id is zero
    if (document.mapCom.shipment_route_id == 0) {
      document.mapCom.assignDriverWithOutRouteId(document.mapCom.loadIdentity, driverid);
    } else { //If shipment Id is present
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
        } else if (decodeBAse64.status == 'success') {
          this.toastr.success(decodeBAse64.message, '', {
            closeButton: true, positionClass: 'toast-top-right', timeOut: 4000
          });
        }
      }, error => {
        console.log(error);
      })

    }

  }

  /**
   * Get Ticket Info from for same coordinate Ticket
   * @param tkt 
   */
  getTktInfo(tkt: string) {
    document.mapCom.showHideModal = 'block';
    document.mapCom.dashboardService.getSameCorrdinateTktInfo(tkt).subscribe((res) => {
      document.mapCom.shipmentInfo.route_name = (res.tktInfo[0].route_name ? res.tktInfo[0].route_name : 'Drop Info');
      document.mapCom.shipmentInfo.ticket = res.tktInfo[0].shipment_ticket;
      document.mapCom.shipmentInfo.customerName = res.tktInfo[0].customer_name;
      document.mapCom.shipmentInfo.address = res.tktInfo[0].fulladdress;
      document.mapCom.shipmentInfo.customerReference = res.tktInfo[0].ref;
      document.mapCom.shipmentInfo.jobType = (res.tktInfo[0].shipment_service_type == 'P' ? 'Collection' : 'Delivery');
      document.mapCom.shipmentInfo.driverName = (res.tktInfo[0].assigned_driver ? res.tktInfo[0].driver_name : 'Assign Driver');
      document.mapCom.shipmentInfo.driverList = (res.tktInfo[0].assigned_driver ? [] : res.driverList);
      document.mapCom.shipmentInfo.assigned_driver = res.tktInfo[0].assigned_driver;
      document.mapCom.shipmentInfo.shipment_routed_id = res.tktInfo[0].shipment_routed_id;
      document.mapCom.shipmentInfo.instaDispatch_loadIdentity = res.tktInfo[0].instaDispatch_loadIdentity;
      document.mapCom.shipmentInfo.booking_type = res.tktInfo[0].instaDispatch_loadGroupTypeCode;
      document.mapCom.shipmentInfo.is_internal = res.tktInfo[0].is_internal;
      if(res.tktInfo[0].assigned_driver == 0){
        document.mapCom.shipmentInfo.drop_type = 'unassinged';
      }else if(res.tktInfo[0].assigned_driver && res.tktInfo[0].shipment_routed_id){
        document.mapCom.shipmentInfo.drop_type = 'assinged';
      }else if(res.tktInfo[0].assigned_driver && res.tktInfo[0].shipment_routed_id && res.tktInfo[0].shipment_routed_id.current_status == 'D'){
        document.mapCom.shipmentInfo.drop_type = 'completed';
      }
    }, error => {
      console.log(error);
    })
  }


  /**
   * Assign Driver From same coordinate popup
   * @param driverId 
   */
  assignDriverSameCordinate(driverId) {

    //if Shipment Route id is zero
    if (document.mapCom.shipmentInfo.shipment_route_id == 0) {
      document.mapCom.assignDriverWithOutRouteId(document.mapCom.shipmentInfo.loadIdentity, driverId);
    } else { //If shipment Id is present
      document.mapCom.assignRouteSameCord =
      {
        'endPointUrl': 'assignUnassignRoute',
        'route_id': '' + document.mapCom.shipmentInfo.shipment_route_id,
        'driver_id': '' + driverId,
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
      document.mapCom.dashboardService.assignDriverToRoute(document.mapCom.assignRouteSameCord).subscribe((response) => {
        //Remove Map Box pop-up
        document.querySelector(".mapboxgl-popup").remove();
        document.mapCom.spinnerService.hide("driverAssign");


        document.mapCom.showHideModal = 'none';//Close modal
        document.querySelector(".modal-backdrop").remove();

        document.mapCom.dashboardService.loadDropOnMapsEmit();//For Realtime Data

        var myStr = response;
        var strArray = myStr.split(".");
        var decodeBAse64 = JSON.parse(atob(strArray[1]));

        if (decodeBAse64.status == 'error') {
          this.toastr.error(decodeBAse64.message, '', {
            closeButton: true, positionClass: 'toast-top-right', timeOut: 40000
          });
        } else if (decodeBAse64.status == 'success') {
          this.toastr.success(decodeBAse64.message, '', {
            closeButton: true, positionClass: 'toast-top-right', timeOut: 4000
          });
        }
      }, error => {
        console.log(error);
      })
    }
  }

  //Show All Drop to fit when click in show all button
  showAllDropToMap() {

    var allCordinates = [];
    if (this.dashboardService.formatedData.data.features.length > 0 && typeof this.dashboardService.formatedData.data.features != 'undefined') {
      for (var index1 in this.dashboardService.formatedData.data.features) {
        allCordinates.push(this.dashboardService.formatedData.data.features[index1].geometry.coordinates)
      }

      var coordinates = allCordinates;

      var bounds = coordinates.reduce(function (bounds, coord) {
        return bounds.extend(coord);
      }, new mapboxgl.LngLatBounds(coordinates[0], coordinates[0]));

      document.mapCom.mapbox.map.fitBounds(bounds, {
        padding: 50
      });
    }
  }

  public async makeMapReady() {

    await this.mapbox.initMap();

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
          "icon-ignore-placement": true,
          "symbol-avoid-edges": true,
          "text-allow-overlap": true
        },
        paint: {
          'text-color': '#000'
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
          "text-allow-overlap": true,
          "icon-ignore-placement": true
        },
        paint: {
          'text-color': '#000'
        }
      });



      //Fit All Points to map
      var allCordinates = [];
      if (this.dashboardService.formatedData.data.features.length > 0 && typeof this.dashboardService.formatedData.data.features != 'undefined') {
        for (var index1 in this.dashboardService.formatedData.data.features) {
          allCordinates.push(this.dashboardService.formatedData.data.features[index1].geometry.coordinates)
        }

        var coordinates = allCordinates;

        var bounds = coordinates.reduce(function (bounds, coord) {
          return bounds.extend(coord);
        }, new mapboxgl.LngLatBounds(coordinates[0], coordinates[0]));

        document.mapCom.mapbox.map.fitBounds(bounds, {
          padding: 50
        });
      }
      //Points to map by click zoom on button click
      document.getElementById('zoomto').addEventListener('click', function () {

        document.mapCom.showAllDropToMap();

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
        document.mapCom.loadIdentity = e.features[0].properties.loadIdentity;


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

        document.mapCom.driverInfoPopup['parcelData'] = [{ active_route: '', no_of_shipment: '', driver_data: {} }];
        //document.mapCom.driverInfoPopup['parcelData'] = document.mapCom.dashboardService.getDriverParcelInfo(driver_id);
        document.mapCom.sub = document.mapCom.dashboardService.getDriverParcelInfo(driver_id).subscribe(quote => {
          document.mapCom.driverInfoPopup['parcelData'] = quote;
        });


        //console.log(document.mapCom.driverInfoPopup);

        document.mapCom.dialog.open(DriverinfoComponent, {
          data: { 'info': document.mapCom.driverInfoPopup }
        });

      });

    });
  }

  //Show All Drop to fit when click in show all button
  showFocusToDrop(res) {

    var allCordinatesLatLng = [];
    if (res) {
      for (var index2 in res.routeLatLng) {
        allCordinatesLatLng.push([res.routeLatLng[index2].shipment_longitude, res.routeLatLng[index2].shipment_latitude]);
      }

      var coordinates = allCordinatesLatLng;

      var bounds = coordinates.reduce(function (bounds, coord) {
        return bounds.extend(coord);
      }, new mapboxgl.LngLatBounds(coordinates[0], coordinates[0]));

      document.mapCom.mapbox.map.fitBounds(bounds, {
        padding: 50
      });
    }
  }

  /**
   * Assign Driver without loadIdentity
   */
  assignDriverWithOutRouteId(loadIdentity, driverid) {
    //Load Spinner
    document.mapCom.spinnerService.show("driverAssign", {
      type: "line-scale-party",
      size: "large",
      color: "white"
    });
    //Get tikt and Route name
    document.mapCom.dashboardService.getDropInfo(loadIdentity).subscribe((response) => {
      if (response.shipmentKey && response.routeName) {
        document.mapCom.dashboardService.sameDayAssignedRoute(response, driverid).subscribe((response) => {

          document.querySelector(".mapboxgl-popup").remove();
          document.mapCom.spinnerService.hide("driverAssign");


          document.mapCom.showHideModal = 'none';//Close modal
          document.querySelector(".modal-backdrop").remove();

          document.mapCom.dashboardService.loadDropOnMapsEmit();//For Realtime Data

          var myStr = response;
          var strArray = myStr.split(".");
          var decodeBAse64 = JSON.parse(atob(strArray[1]));

          if (decodeBAse64.status == 'error') {
            this.toastr.error(decodeBAse64.message, '', {
              closeButton: true, positionClass: 'toast-top-right', timeOut: 40000
            });
          } else if (decodeBAse64.status == 'success') {
            this.toastr.success(decodeBAse64.message, '', {
              closeButton: true, positionClass: 'toast-top-right', timeOut: 4000
            });
          }
        })
      } else {
        document.mapCom.spinnerService.hide("driverAssign");
        this.toastr.info('Shipment Tickets Not Available !', '', {
          closeButton: true, positionClass: 'toast-top-right', timeOut: 40000
        });
      }
    }, error => {
      console.log(error);
      document.querySelector(".mapboxgl-popup").remove();
      document.mapCom.spinnerService.hide("driverAssign");
    })
  }

  //Show View Details When one shipment on one address
  viewDetailsFromMap(index,type){
    if(type == 'unassinged'){
      type = 'unassign';
    }else if(type == 'assinged'){
      type = 'assign';
    }
    this.sideNavLeft.viewDetails(this.dashboardService.mapData.mapPlotData[index],type);
  }

  //Show View Details When multiple shipment on one address
  viewDetailsFromSameCordinate(){
    //This value is getting from getTktInfo();
    var type = document.mapCom.shipmentInfo.drop_type;
    //Hide modal
    document.mapCom.showHideModal = 'none'; 
    if(type == 'unassinged'){
      type = 'unassign';
    }else if(type == 'assinged'){
      type = 'assign';
    }
    this.sideNavLeft.viewDetails(document.mapCom.shipmentInfo,type);
  }

}
