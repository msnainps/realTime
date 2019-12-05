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
  releaseShipmentTkt:any = [];
  cardedFormModel: any = {};
  cardedeOptions:any = ['CARDED'];
  cradedTktList:any = [];
  shipRouteId:any = '';
  rlsTktList:any = [];
  deliverFormModel: any = {};
  deliverTktList:any = [];
 

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
    private dashboardService: DashboardService,
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

  onSelectionChanged(event){ //When select check box from grid
    this.releaseShipmentTkt = event.api.getSelectedRows();
  }

  //Release shipment
  processReleaseShipment() {
    
    
    if(this.releaseShipmentTkt.length > 0){ //If selected
      this.spinerService.show("releasejob", {
        type: "line-scale-party",
        size: "large",
        color: "white"
      });

      for (var i = 0; i < this.releaseShipmentTkt.length; i++) {
        this.rlsTktList.push(this.releaseShipmentTkt[i].shipment_ticket);
      }
      this.shipRouteId = ''+this.releaseShipmentTkt[0].shipment_routed_id;
      //releaselJob
      this.sidenavleftservice.releaselJob(this.rlsTktList,this.shipRouteId).subscribe(res => {

        this.dashboardService.loadDropOnMapsEmit();////For Realtime Data
        var strArray = res.split(".");
        var decodeBAse64 = JSON.parse(atob(strArray[1]));

        this.toastr.success(decodeBAse64.message, '', {
          closeButton: true, positionClass: 'toast-top-right', timeOut: 4000
        });

        this.spinerService.hide("releasejob");
      })
    }else{
      this.toastr.warning('Please select shipment', '', {
        closeButton: true, positionClass: 'toast-top-right', timeOut: 2000
      });
    }
  }

  //Carded Job
  onClickCarded(){
    console.log(this.cardedFormModel);
    
    if(this.releaseShipmentTkt.length > 0 && Object.keys(this.cardedFormModel).length > 0){ //If selected
      this.spinerService.show("carded", {
        type: "line-scale-party",
        size: "large",
        color: "white"
      });

      for (var i = 0; i < this.releaseShipmentTkt.length; i++) {
        this.cradedTktList.push(this.releaseShipmentTkt[i].shipment_ticket);
      }
      this.shipRouteId = ''+this.releaseShipmentTkt[0].shipment_routed_id;
      //releaselJob
      this.sidenavleftservice.cardedJob(this.cradedTktList,this.shipRouteId,this.cardedFormModel).subscribe(res => {

        this.cardedFormModel = ''; //Reset Form Model

        this.dashboardService.loadDropOnMapsEmit();////For Realtime Data
        var strArray = res.split(".");
        var decodeBAse64 = JSON.parse(atob(strArray[1]));

        this.toastr.success(decodeBAse64.message, '', {
          closeButton: true, positionClass: 'toast-top-right', timeOut: 4000
        });

        this.spinerService.hide("carded");
      })
    }else{
      this.toastr.error('Form value required!', '', {
        closeButton: true, positionClass: 'toast-top-right', timeOut: 2000
      });
    }
  }


  /**
   * Deliver Job
   */
  onClickDeliver(){
    console.log(this.deliverFormModel);

    if(this.releaseShipmentTkt.length > 0 && Object.keys(this.deliverFormModel).length > 0){ //If selected
      this.spinerService.show("deliverJob", {
        type: "line-scale-party",
        size: "large",
        color: "white"
      });

      for (var i = 0; i < this.releaseShipmentTkt.length; i++) {
        this.deliverTktList.push(this.releaseShipmentTkt[i].shipment_ticket);
      }
      this.shipRouteId = ''+this.releaseShipmentTkt[0].shipment_routed_id;
      //releaselJob
      this.sidenavleftservice.deliverJob(this.deliverTktList,this.shipRouteId,this.deliverFormModel).subscribe(res => {

        this.deliverFormModel = ''; //Reset Form Model

        this.dashboardService.loadDropOnMapsEmit();////For Realtime Data
        var strArray = res.split(".");
        var decodeBAse64 = JSON.parse(atob(strArray[1]));

        this.toastr.success(decodeBAse64.message, '', {
          closeButton: true, positionClass: 'toast-top-right', timeOut: 4000
        });

        this.spinerService.hide("deliverJob");
      })
    }else{
      this.toastr.error('Form value required!', '', {
        closeButton: true, positionClass: 'toast-top-right', timeOut: 2000
      });
    }
  }

  downloadExportCageSheet(){
//     var doc = new jsPDF();
//     //doc.text(20, 20, 'This PDF has a title, subject, author, keywords and a creator.');

//        var col = ["Sr. No.","Details"];
//        var col1 = ["Details", "Values"];
//        var rows = [];
//        var rows1 = [];

//        var itemNew = [

//         { index:'1',id: 'Case Number', name : '101111111' },
//         { index:'2',id: 'Patient Name', name : 'UAT DR' },
//         { index:'3',id: 'Hospital Name', name: 'Dr Abcd' }
      
//       ]

//        itemNew.forEach(element => {      
//         var temp = [element.index,element.id];
//         var temp1 = [element.id,element.name];
//         rows.push(temp);
//         rows1.push(temp1);
//       });        

//         //doc.table(col, rows, { startY: 10 },{});

//         //==doc.autoTable(col1, rows1, { startY: 60 });
//         doc.save('Test.pdf');

// //Output as Data URI
//     //doc.save('Test.pdf');
//     doc.output('dataurlnewwindow');
    // const header1 = new Cell('Header1');
    // const header2 = new Cell('Header2');
    // const header3 = new Cell('Header3', { fillColor: '#cecece' });
 
    // // Create headers row
    // const headerRows = new Row([header1, header2, header3]);
 
    // // Create a content row
    // const row1 = new Row([new Cell('One value goes here '), new Cell('Another one here'), new Cell('OK?')]);
 
    // // Custom  column widths
    // const widths = [100, '*', 200, '*'];
 
    // // Create table object
    // const table = new Table(headerRows, [row1], widths);
 
    // Add table to document
    // this.pdfmake.addTable(table);
    // this.pdfmake.open();
    // this.pdfmake.download();
  }

}
