import { Component, OnInit, Input } from '@angular/core';
import { SidenavLeftService } from './sidenav-left.service';
import { SidenavLeftOperationComponent } from './sidenav-left-operation/sidenav-left-operation.component';
import { ToastrService } from 'ngx-toastr';
import { NgxSpinnerService } from 'ngx-spinner';
import { DashboardComponent } from '../dashboard.component';





@Component({
  selector: 'app-sidenav-left',
  templateUrl: './sidenav-left.component.html',
  styleUrls: ['./sidenav-left.component.css']
})
export class SidenavLeftComponent implements OnInit {

  shipment_ticket:any;
  shipment_route_name:any;
  shipment_route_id:any;
  driverList:any[] = [];
  assignDriverFormModel: any = {};
  rowData:any;
  routeName:any;
  driverName:any;
 
  
  @Input() sidebarLeftNavOp:SidenavLeftOperationComponent; //Send Data to SidenavLeftOperationComponent
  constructor(private sidenaveleftService:SidenavLeftService,private toastr: ToastrService,private spinerService: NgxSpinnerService,private dashboradCmp:DashboardComponent) { }

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

  assignJob(shipmentTicket,shipmenRouteId,shipmentRouteName){
    //Fill RouteName and Todays Date
    this.sidebarLeftNavOp.assignDriverFormModel.route_name = shipmentRouteName;
    this.sidebarLeftNavOp.assignDriverFormModel.assign_date_time = new Date();
    

    this.sidebarLeftNavOp.showHideModal = 'block';
    //get Driver List
    this.sidenaveleftService.getDriverList().subscribe(quote => {
      this.sidebarLeftNavOp.driverList = quote.driver_data;
    });

    //get All Ticket
    this.sidenaveleftService.getAllTickets(shipmentTicket,shipmenRouteId).subscribe(res => {
      if(res.ticket_list.length > 0){
      this.sidebarLeftNavOp.assignDriverFormModel.shipment_ticket = res.ticket_list[0]['tktList'];
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

    this.sidebarLeftNavOp.releaseShipmentTkt = '';//Reset selected checkbox from grid
    this.sidebarLeftNavOp.routeType = type;
    this.sidebarLeftNavOp.shipment_route_id = data.shipment_routed_id; //Used while download PDF
    this.sidebarLeftNavOp.booking_type = data.booking_type //Used while diputed and Roteassign
    this.sidenaveleftService.getRouteDetails(data.shipment_routed_id,type).subscribe(resp => {
      if(resp.routeDetailsData.length > 0){
      this.sidebarLeftNavOp.rowData = resp.routeDetailsData;
      }
      if(resp.routeInfo.length > 0){
      this.sidebarLeftNavOp.routeName = resp.routeInfo[0].route_name;
      this.sidebarLeftNavOp.driverName = resp.routeInfo[0].driver_name;
      }
    });

    //get Disputed List && get Assign Route List 
    if(type == 'unassign'){
      this.sidenaveleftService.getDispuedList().subscribe(resp => {
        this.sidebarLeftNavOp.disputedList = JSON.parse(resp).message;
      });

      this.sidenaveleftService.getAssignRouteList().subscribe(resp => {
        this.sidebarLeftNavOp.assignRouteList = JSON.parse(resp).message;
      });
    }


    //Get Shipment Traking Info
    var Jtypes = data.booking_type.toLowerCase();
    if(Jtypes == 'next' || Jtypes == 'same'){
    this.sidenaveleftService.getShipmentTrakingInfo(data.instaDispatch_loadIdentity,data.is_internal,data.booking_type).subscribe(resp => {
      this.spinerService.hide('view-details');
      var strArray = resp.split(".");
      var decodeBAse64 = JSON.parse(atob(strArray[1]));
      if(Jtypes == 'next'){
        this.sidebarLeftNavOp.rowDataTrakingInfo = decodeBAse64.nextday.trackinginfo;
      }else if(Jtypes == 'same'){
        this.sidebarLeftNavOp.rowDataTrakingInfo = decodeBAse64.sameday.trackinginfo;
      }
    });
  }else{
    this.spinerService.hide('view-details');
  }

    
    

  }

  focusOnDrops(routId){
   //get Latlng for this route
   this.sidenaveleftService.getLatLng(routId).subscribe(res => {
      this.dashboradCmp.showFocusToDrop(res);
   });
  }

  

}
