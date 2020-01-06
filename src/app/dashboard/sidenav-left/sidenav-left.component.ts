import { Component, OnInit, Input } from '@angular/core';
import { SidenavLeftService } from './sidenav-left.service';
import { SidenavLeftOperationComponent } from './sidenav-left-operation/sidenav-left-operation.component';
import { ToastrService } from 'ngx-toastr';
import { NgxSpinnerService } from 'ngx-spinner';
import { DashboardComponent } from '../dashboard.component';
import { formatDate } from '@angular/common';
import { config } from 'src/config/config';





@Component({
  selector: 'app-sidenav-left',
  templateUrl: './sidenav-left.component.html',
  styleUrls: ['./sidenav-left.component.css']
})
export class SidenavLeftComponent implements OnInit {

  configSettings = new config;
  shipment_ticket:any;
  shipment_route_name:any;
  shipment_route_id:any;
  driverList:any[] = [];
  assignDriverFormModel: any = {};
  rowData:any;
  routeName:any;
  driverName:any;
 
  
  @Input() sidebarLeftNavOp:SidenavLeftOperationComponent; //Send Data to SidenavLeftOperationComponent
  constructor(
    private sidenaveleftService:SidenavLeftService,
    private toastr: ToastrService,
    private spinerService: NgxSpinnerService,
    private dashboradCmp:DashboardComponent
    ) { 
     this.dashboradCmp.sideNavLeft=this;
    }

  ngOnInit() {
    this.sidenaveleftService.getAssignDropData();
  }

  cancelShipment(shipmentTkt){
    this.sidebarLeftNavOp.showHideModal = 'block';
    this.sidebarLeftNavOp.shipment_ticket = shipmentTkt;
  }

  WithdrawRoute(shipmentRouteName,shipmentRouteId){
    this.sidebarLeftNavOp.showHideModal = 'block';
    this.sidebarLeftNavOp.shipment_route_name = shipmentRouteName;
    this.sidebarLeftNavOp.shipment_route_id = shipmentRouteId;
  }

  assignJob(shipmentTicket,laodIdentity,collection_date){
    console.log(collection_date);
    //Fill RouteName and Todays Date
    //this.sidebarLeftNavOp.assignDriverFormModel.route_name = shipmentRouteName;
   
    if (this.configSettings.env.country_code.toLowerCase() == 'us' || this.configSettings.env.country_code.toLowerCase() == 'usa') {
      var dt =  formatDate(new Date(collection_date), 'MM-dd-yyyy hh:mm:ss a', 'en-US', '+0530');  
    } else {
      var dt =  formatDate(new Date(collection_date), 'dd-MM-yyyy hh:mm:ss a', 'en-US', '+0530');
    }
    
    this.sidebarLeftNavOp.assignDriverFormModel.assign_date_time = new Date(dt);
    

    this.sidebarLeftNavOp.showHideModal = 'block';
    //get Driver List
    this.sidenaveleftService.getDriverList().subscribe(quote => {
      this.sidebarLeftNavOp.driverList = quote.driver_data;
    });

    //get All Ticket
    this.sidenaveleftService.getAllTickets(shipmentTicket,laodIdentity).subscribe(res => {
      if(res.shipmentKey){
      this.sidebarLeftNavOp.assignDriverFormModel.shipment_ticket = res.shipmentKey;
      this.sidebarLeftNavOp.tmpRouteName = res.routeName;
      }else{
        this.toastr.info('You can not assign driver to this job !!', '', {
          closeButton: true, positionClass: 'toast-top-right', timeOut: 4000
        });
        this.sidebarLeftNavOp.driverList = [];
      }
    });
  }

  viewDetails(data,type){
    this.spinerService.show("view-details", {
      type: "line-scale-party",
      size: "large",
      color: "white"
    });
    this.sidebarLeftNavOp.showHideModal = 'block';
    this.sidebarLeftNavOp.rowData = ''; //Reset Grid Data
    this.sidebarLeftNavOp.rowDataTrakingInfo = '';//Reset Traking Info row data
    this.sidebarLeftNavOp.routeName = '';
    this.sidebarLeftNavOp.driverName = '';
    this.sidebarLeftNavOp.trakingCallStatus = false;

    this.sidebarLeftNavOp.releaseShipmentTkt = '';//Reset selected checkbox from grid
    this.sidebarLeftNavOp.routeType = type;
    this.sidebarLeftNavOp.shipment_route_id = data.shipment_routed_id; //Used while download PDF
    this.sidebarLeftNavOp.booking_type = data.booking_type //Used while diputed and Roteassign
    this.sidebarLeftNavOp.drop_type = data.drop_type

    var param;
    if(type == 'unassign'){
      param = data.instaDispatch_loadIdentity;
    }else{
      param = data.shipment_routed_id;
    }
    
   

    this.sidebarLeftNavOp.selectedIndex = 0; //Show Active view details Tab

    //get View details data
    this.sidenaveleftService.getRouteDetails(param,type).subscribe(resp => {
      
      if(resp.routeDetailsData.length > 0){
      this.sidebarLeftNavOp.rowData = resp.routeDetailsData;
      }
      if(resp.routeInfo){
      if(resp.routeInfo.length > 0){
      this.sidebarLeftNavOp.routeName = resp.routeInfo[0].route_name;
      this.sidebarLeftNavOp.driverName = resp.routeInfo[0].driver_name;
      }
     }
     this.spinerService.hide('view-details');
     this.sidebarLeftNavOp.totalJobItem = resp.totalItem[0].total_item;
    });

    //get Disputed List && get Assign Route List 
    if(type == 'unassign' || type == 'unassinged'){
      this.sidenaveleftService.getDispuedList().subscribe(resp => {
        this.sidebarLeftNavOp.disputedList = JSON.parse(resp).message;
      });

      this.sidenaveleftService.getAssignRouteList().subscribe(resp => {
        this.sidebarLeftNavOp.assignRouteList = JSON.parse(resp).message;
      });
    }

   //Used to get traking info
    this.sidebarLeftNavOp.trakingInfoRequiredData = data;

  }

  //Move to map pointer
  focusOnDrops(data){
   //get Latlng for this route
   this.sidenaveleftService.getLatLng(data).subscribe(res => {
      this.dashboradCmp.showFocusToDrop(res);
   });
  }

}
