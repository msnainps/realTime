import { Component, OnInit, Input, ɵCompiler_compileModuleAndAllComponentsAsync__POST_R3__ } from '@angular/core';
import { SidenavLeftService } from './sidenav-left.service';
import { SidenavLeftOperationComponent } from './sidenav-left-operation/sidenav-left-operation.component';




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
  @Input() sidebarLeftNavOp:SidenavLeftOperationComponent; //Send Data to SidenavLeftOperationComponent
  constructor(private sidenaveleftService:SidenavLeftService) { }

  ngOnInit() {
    this.sidenaveleftService.getAssignDropData();
  }

  cancelShipment(shipmentTkt){
    this.sidebarLeftNavOp.shipment_ticket = shipmentTkt;
  }

  WithdrawRoute(shipmentRouteName,shipmentRouteId){
    this.sidebarLeftNavOp.shipment_route_name = shipmentRouteName;
    this.sidebarLeftNavOp.shipment_route_id = shipmentRouteId;
  }

  assignJob(shipmentTicket,shipmenRouteId){
    //get Driver List
    this.sidenaveleftService.getDriverList().subscribe(quote => {
      this.sidebarLeftNavOp.driverList = quote.driver_data;
    });

    //get All Ticket
    this.sidenaveleftService.getAllTickets(shipmentTicket,shipmenRouteId).subscribe(res => {
      this.sidebarLeftNavOp.assignDriverFormModel.shipment_ticket = res.ticket_list[0]['tktList'];
    });
  }

}
