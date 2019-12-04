import { Component, OnInit } from '@angular/core';
import { NgxSpinnerService } from 'ngx-spinner';
import { SidenavLeftService } from '../sidenav-left.service';
import { ToastrService } from 'ngx-toastr';
import { FormGroup, FormBuilder } from '@angular/forms';
import { DashboardService } from '../../dashboard.service';
import { AllCommunityModules } from '@ag-grid-community/all-modules';





@Component({
  selector: 'app-sidenav-left-operation', //This component is added in dashboard.component.html
  templateUrl: './sidenav-left-operation.component.html',
  styleUrls: ['./sidenav-left-operation.component.css']
})
export class SidenavLeftOperationComponent implements OnInit {

  assignDriverFormModel: any = {};
  shipment_ticket: any;
  shipment_route_name: any;
  shipment_route_id: any;
  driverList: any[] = [];
  rowData:any;
  routeName:any;
  driverName:any;
  routeType:any;

  selectionMode = 'multiple';
  //Grid headers
  columnDefs = [
    {headerName: 'Docket No', field: 'docket_no', sortable: true, filter: true, checkboxSelection: true,headerCheckboxSelection: true},
    {headerName: 'Service', field: 'service_type', sortable: true, filter: true},
    {headerName: 'Service Date', field: 'service_date', sortable: true, filter: true},
    {headerName: 'Service Time', field: 'service_time', sortable: true, filter: true},
    {headerName: 'Weight', field: 'weight', sortable: true, filter: true},
    {headerName: 'Postcode', field: 'postcode', sortable: true, filter: true},
    {headerName: 'Consignee Name', field: 'consignee_name', sortable: true, filter: true},
    {headerName: 'Address1', field: 'address1', sortable: true, filter: true},
    {headerName: 'Phone', field: 'phone', sortable: true, filter: true},
    {headerName: 'Execution Order', field: 'execution_order', sortable: true, filter: true},
    {headerName: 'Attempt', field: 'attempt', sortable: true, filter: true},
    {headerName: 'Estimated Time', field: 'estimatedtime', sortable: true, filter: true},
    {headerName: 'Status', field: 'current_status', sortable: true, filter: true},
    {headerName: 'Action', field: 'action'},
  ];

 

  modules = AllCommunityModules;

  constructor(
    private spinerService: NgxSpinnerService, 
    private sidenavleftservice: SidenavLeftService, 
    private toastr: ToastrService, 
    private dashboardService: DashboardService
    ) {

  }

  ngOnInit() {
  }


  /**
   * Cancel Shipment
   * @param shipmentTkt
   */
  processCancelShipment(shipmentTkt) {
    this.spinerService.show("cancelJob", {
      type: "line-scale-party",
      size: "large",
      color: "white"
    });

    //Check shipment ticket is eligible or not
    this.sidenavleftservice.checkEligibleForCancel(shipmentTkt).subscribe(val => {
      var myStr = val;
      var strArray = myStr.split(".");
      var decodeBAse64 = JSON.parse(atob(strArray[1]));
      if (decodeBAse64.status == 'fail') { //If not eligible for cancel
        this.toastr.info(decodeBAse64.message, '', {
          closeButton: true, positionClass: 'toast-top-right', timeOut: 4000
        });
        this.spinerService.hide("cancelJob");
      } else {

        //Cancel Job if eligible
        this.sidenavleftservice.cancelJob(shipmentTkt).subscribe(res => {

          this.dashboardService.loadDropOnMapsEmit();////For Realtime Data
          var strArray = res.split(".");
          var decodeBAse64 = JSON.parse(atob(strArray[1]));

          this.toastr.success('Job Cancelled Sucessfully', '', {
            closeButton: true, positionClass: 'toast-top-right', timeOut: 4000
          });

          this.spinerService.hide("cancelJob");
        })
      }
    });
  }

  /**
   * Withdraw Route by shipment route id
   */
  processWithdrawShipment = (shipmentRouteId) => {
    this.spinerService.show("withdrawJob", {
      type: "line-scale-party",
      size: "large",
      color: "white"
    });


    this.sidenavleftservice.withdrawAssignedRoute(shipmentRouteId).subscribe(val => {
      this.dashboardService.loadDropOnMapsEmit();////For Realtime Data
      var myStr = val;
      var strArray = myStr.split(".");
      var decodeBAse64 = JSON.parse(atob(strArray[1]));
      if (decodeBAse64.status == 'fail') {
        this.toastr.info(decodeBAse64.message, '', {
          closeButton: true, positionClass: 'toast-top-right', timeOut: 4000
        });
        this.spinerService.hide("withdrawJob");
      } else {
        this.toastr.success(decodeBAse64.message, '', {
          closeButton: true, positionClass: 'toast-top-right', timeOut: 4000
        });
        this.spinerService.hide("withdrawJob");
      }
    });
  }

  /**
   * Assign Driver To Route
   */
  onClickAssignDriver = () => {


    this.spinerService.show("driverAssign", {
      type: "line-scale-party",
      size: "large",
      color: "white"
    });

    this.sidenavleftservice.sameDayAssignedRoute(this.assignDriverFormModel).subscribe(val => {
      this.dashboardService.loadDropOnMapsEmit();////For Realtime Data
      var myStr = val;
      var strArray = myStr.split(".");
      var decodeBAse64 = JSON.parse(atob(strArray[1]));
      if (decodeBAse64.status == 'error') {
        this.toastr.error(decodeBAse64.message, '', {
          closeButton: true, positionClass: 'toast-top-right', timeOut: 4000
        });
        this.spinerService.hide("driverAssign");
      } else {
        this.toastr.success(decodeBAse64.message, '', {
          closeButton: true, positionClass: 'toast-top-right', timeOut: 4000
        });
        this.spinerService.hide("driverAssign");
      }
      this.assignDriverFormModel = '';
    });

  }

  onSelectionChanged(event){
    //console.log(event.api.getFocusedCell());
    //console.log(event.api.getDisplayedRowAtIndex(1));
    console.log(event.api.getSelectedRows());
  }

  processReleaseShipment = () => {

  }

}
