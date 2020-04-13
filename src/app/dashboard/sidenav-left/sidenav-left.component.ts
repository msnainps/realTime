import { Component, OnInit, Input } from '@angular/core';
import { SidenavLeftService } from './sidenav-left.service';
import { SidenavLeftOperationComponent } from './sidenav-left-operation/sidenav-left-operation.component';
import { ToastrService } from 'ngx-toastr';
import { NgxSpinnerService } from 'ngx-spinner';
import { DashboardComponent } from '../dashboard.component';
import { formatDate } from '@angular/common';
import { config } from 'src/config/config';
import { SharedService } from 'src/app/shared/shared.service';






@Component({
  selector: 'app-sidenav-left',
  templateUrl: './sidenav-left.component.html',
  styleUrls: ['./sidenav-left.component.css']
})
export class SidenavLeftComponent implements OnInit {

  configSettings = new config;
  shipment_ticket: any;
  shipment_route_name: any;
  shipment_route_id: any;
  driverList: any[] = [];
  assignDriverFormModel: any = {};
  rowData: any;
  routeName: any;
  driverName: any;
  param: any = {};
  getFocusLatLong = '';
  panelOpenState: boolean;



  @Input() sidebarLeftNavOp: SidenavLeftOperationComponent; //Send Data to SidenavLeftOperationComponent
  constructor(
    public sidenaveleftService: SidenavLeftService,
    private toastr: ToastrService,
    private spinerService: NgxSpinnerService,
    private dashboradCmp: DashboardComponent,
    private sharedService: SharedService
  ) {
    this.dashboradCmp.sideNavLeft = this;
    this.sharedService.sidecmp = this;
  }

  ngOnInit() {
    this.sidenaveleftService.getAssignDropData();
  }

  cancelShipment(shipmentTkt) {
    this.sidebarLeftNavOp.showHideModal = 'block';
    this.sidebarLeftNavOp.shipment_ticket = shipmentTkt;
  }

  WithdrawRoute(shipmentRouteName, shipmentRouteId) {
    this.sidebarLeftNavOp.showHideModal = 'block';
    this.sidebarLeftNavOp.shipment_route_name = shipmentRouteName;
    this.sidebarLeftNavOp.shipment_route_id = shipmentRouteId;
  }

  assignJob(data) {

    //Fill RouteName and Todays Date
    //this.sidebarLeftNavOp.assignDriverFormModel.route_name = shipmentRouteName;
    this.sidebarLeftNavOp.assignDriverFormModel.driver_id = '';
    this.sidebarLeftNavOp.assignDriverFormModel.hub_id = '';




    // try {
    //   if (this.configSettings.env.country_code.toLowerCase() == 'us' || this.configSettings.env.country_code.toLowerCase() == 'usa') {
    //     var dt = formatDate(new Date(data.collection_date), 'MM-dd-yyyy hh:mm:ss a', 'en-US', '+0530');
    //   } else {
    //     var dt = formatDate(new Date(data.collection_date), 'dd-MM-yyyy hh:mm:ss a', 'en-US', '+0530');
    //   }
    //   this.sidebarLeftNavOp.assignDriverFormModel.assign_date_time = new Date(dt);
    // } catch (err) {
    //   console.log(err.message);
    //   this.sidebarLeftNavOp.assignDriverFormModel.assign_date_time = new Date();
    // }


    try {
      var assignDatTime = data.collection_date.split(" ");
      var onlyDate = assignDatTime[0].split("/");//Split Date
      var onlyTime = assignDatTime[1].split(":");//Split Time
      var cdate = onlyDate[0];
      var cmonth = onlyDate[1] - 1;
      var cyear = onlyDate[2];
      var chour = onlyTime[0];
      var cminute = onlyTime[1];

      console.log(data.collection_date);
      
      this.sidebarLeftNavOp.assignDriverFormModel.assign_date_time = new Date(cyear, cmonth, cdate, chour, cminute, 0);

    } catch (err) {
      console.log(err.message);
      this.sidebarLeftNavOp.assignDriverFormModel.assign_date_time = new Date();
    }

    this.sidebarLeftNavOp.showHideModal = 'block';

    //get hub list
    this.sidenaveleftService.getHubList().subscribe(quote => {
      this.sidebarLeftNavOp.hubList = quote.hub_data
    });

    //get Driver List
    this.sidenaveleftService.getDriverList().subscribe(quote => {
      this.sidebarLeftNavOp.driverList = quote.driver_data;
      this.sidebarLeftNavOp.tmpDriverList = quote.driver_data;
    });

    //get All Ticket
    this.sidenaveleftService.getAllTickets(data).subscribe(res => {
      if (res.shipmentKey) {
        if (data.next_day_jobtype == 'only-collection' && data.booking_type == 'NEXT') {
          this.sidebarLeftNavOp.assignDriverFormModel.shipment_ticket = data.shipment_ticket;
        } else {
          this.sidebarLeftNavOp.assignDriverFormModel.shipment_ticket = res.shipmentKey;
        }
        this.sidebarLeftNavOp.tmpRouteName = res.routeName;
      } else {
        this.toastr.info('You can not assign driver to this job !!', '', {
          closeButton: true, positionClass: 'toast-top-right', timeOut: 4000
        });
        this.sidebarLeftNavOp.driverList = [];
      }
    });
  }

  viewDetails(data, type) {
    this.spinerService.show("view-details", {
      type: "line-scale-party",
      size: "large",
      color: "white"
    });
    this.sidebarLeftNavOp.showHideModal = 'block';
    this.sidebarLeftNavOp.rowData = ''; //Reset Grid Data
    this.sidebarLeftNavOp.rowDataByParcelInfo = '';//Reset Byparcel row data
    this.sidebarLeftNavOp.rowDataTrackingInfo = '';//Reset Traking Info row data
    this.sidebarLeftNavOp.rowDataPodInfo = '';//Reset POD Info row data
    this.sidebarLeftNavOp.routeName = '';
    this.sidebarLeftNavOp.driverName = '';
    this.sidebarLeftNavOp.trakingCallStatus = false;

    this.sidebarLeftNavOp.releaseShipmentTkt = '';//Reset selected checkbox from grid
    this.sidebarLeftNavOp.routeType = type;
    this.sidebarLeftNavOp.shipment_route_id = data.shipment_routed_id; //Used while download PDF
    this.sidebarLeftNavOp.booking_type = data.booking_type //Used while diputed and Ruteteassign and POD lable create
    this.sidebarLeftNavOp.drop_type = data.drop_type


    // if (type == 'unassign') {
    //   this.param.routeId = data.instaDispatch_loadIdentity;
    // } else {
    //   this.param.routeId = data.shipment_routed_id;
    // }

    if (data.next_day_jobtype == 'undefined' || typeof data.next_day_jobtype == 'undefined') {
      data.next_day_jobtype = '';
    }

    if (data.shipment_routed_id > 0) {
      this.param.routeId = data.shipment_routed_id;
      this.param.next_day_jobtype = data.next_day_jobtype;
    } else {
      this.param.routeId = data.instaDispatch_loadIdentity;
      this.param.next_day_jobtype = data.next_day_jobtype;
    }

    console.log(this.param);

    //For POD download
    this.param.customer_id = data.customer_id
    this.sidebarLeftNavOp.loadIdentity = data.instaDispatch_loadIdentity;


    this.sidebarLeftNavOp.selectedIndex = 0; //Show Active view details Tab

    //get View details data
    this.sidenaveleftService.getRouteDetails(this.param, type).subscribe(resp => {
      if (resp.routeDetailsData.length > 0) {
        this.sidebarLeftNavOp.rowData = resp.routeDetailsData;
      }
      if (resp.routeInfo) {
        if (resp.routeInfo.length > 0) {
          this.sidebarLeftNavOp.routeName = resp.routeInfo[0].route_name;
          this.sidebarLeftNavOp.driverName = resp.routeInfo[0].driver_name;
        }
      }
      this.spinerService.hide('view-details');
      this.sidebarLeftNavOp.totalJobItem = resp.totalItem[0].total_item;
      if (resp.accountNumber.length) {
        this.sidebarLeftNavOp.customerAccountNumber = resp.accountNumber[0].accountnumber
      } else {
        this.sidebarLeftNavOp.customerAccountNumber = '';
      }

      this.sidebarLeftNavOp.vehicle_cat_name = resp.vehicle_cat_name;
    });

    //get Disputed List && get Assign Route List 
    if (type == 'unassign' || type == 'unassinged') {
      this.sidenaveleftService.getDispuedList().subscribe(resp => {
        this.sidebarLeftNavOp.disputedList = JSON.parse(resp).message;
      });

      this.sidenaveleftService.getAssignRouteList().subscribe(respRoutes => {
        this.sidebarLeftNavOp.assignRouteList = JSON.parse(respRoutes).message;
      });
    }

    //Used to get traking info
    this.sidebarLeftNavOp.trakingInfoRequiredData = data;

  }

  //Move to map pointer
  focusOnDrops(data) {
    //get Latlng for this route
    this.sidenaveleftService.getLatLng(data);

  }
  alertMeWhenGetLatLng() {
    this.dashboradCmp.showFocusToDrop(this.sidenaveleftService.setFocusLatLong);
  }

  assignJobToCx(unassingedInfo){
    if(unassingedInfo.booking_type == "SAME") {
      this.sidebarLeftNavOp.loadIdentity = unassingedInfo.instaDispatch_loadIdentity 
    }
  }

}
