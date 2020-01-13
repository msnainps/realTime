import { Component, OnInit } from '@angular/core';
import { NgxSpinnerService } from 'ngx-spinner';
import { SidenavLeftService } from '../sidenav-left.service';
import { ToastrService } from 'ngx-toastr';
import { FormGroup, FormBuilder, Validators } from '@angular/forms';
import { DashboardService } from '../../dashboard.service';
import { AllCommunityModules } from '@ag-grid-community/all-modules';
import pdfMake from 'pdfmake/build/pdfmake';
import pdfFonts from 'pdfmake/build/vfs_fonts';
pdfMake.vfs = pdfFonts.pdfMake.vfs;
import { Observable, Observer, throwError, observable } from 'rxjs';
import { DateTimeAdapter } from 'ng-pick-datetime';
import { config } from 'src/config/config';





@Component({
  selector: 'app-sidenav-left-operation', //This component is added in dashboard.component.html
  templateUrl: './sidenav-left-operation.component.html',
  styleUrls: ['./sidenav-left-operation.component.css']
})
export class SidenavLeftOperationComponent implements OnInit {

  getCountrtTime = new config();

  assignDriverFormModel: any = {};
  shipment_ticket: any;
  shipment_route_name: any;
  shipment_route_id: any;
  driverList: any[] = [];
  rowData: any;
  routeName: any;
  driverName: any;
  routeType: any;
  releaseShipmentTkt: any = [];
  cardedFormModel: any = {};
  cardedeOptions: any = ['CARDED'];
  cradedTktList: any = [];
  shipRouteId: any = '';
  rlsTktList: any = [];
  deliverFormModel: any = {};
  deliverTktList: any = [];
  pdf: any;
  deliverFormVal: FormGroup;
  selectionMode = 'multiple';
  submittedDelV = false;
  cardedFormVal: FormGroup;
  submittedCard = false;
  assignDriverFormVal: FormGroup;
  submittedAssign = false;
  showHideModal = 'block';
  //Resize grid column
  private defaultColDef;
  disputedList: any;
  booking_type: any;
  resetDisputed: any = { action_id: 0 };
  assignRouteList: any;
  resetAssignRoute: any = { shipment_route_id: 0 };
  rowDataTrakingInfo: any;
  frameworkComponents;
  drop_type: any;
  public selectedIndex: number = 0;
  trakingInfoRequiredData;
  trakingCallStatus = false;
  tmpRouteName;
  totalJobItem;
  private gridApi;
  overlayLoadingTemplate;
  customerAccountNumber;
  loadIdentity;

  //Grid headers
  columnDefs = [
    { headerName: 'Docket No', field: 'docket_no', width: 200, sortable: true, filter: true, checkboxSelection: true, headerCheckboxSelection: true },
    { headerName: 'Service', field: 'service_type', width: 100, sortable: true, filter: true },
    { headerName: 'Service Date', field: 'service_date', width: 100, sortable: true, filter: true },
    { headerName: 'Service Time', field: 'service_time', width: 100, sortable: true, filter: true },
    { headerName: 'Weight', field: 'weight', width: 7, sortable: true, filter: true },
    { headerName: 'Postcode', field: 'postcode', width: 120, sortable: true, filter: true },
    { headerName: 'Consignee Name', field: 'consignee_name', width: 250, sortable: true, filter: true },
    { headerName: 'Address1', field: 'address1', width: 150, sortable: true, filter: true },
    { headerName: 'Phone', field: 'phone', width: 150, sortable: true, filter: true },
    { headerName: 'Execution Order', field: 'execution_order', width: 100, sortable: true, filter: true },
    { headerName: 'Attempt', field: 'attempt', width: 100, sortable: true, filter: true },
    { headerName: 'Estimated Time', field: 'estimatedtime', width: 100, sortable: true, filter: true },
    { headerName: 'Status', field: 'current_status', width: 100, sortable: true, filter: true }
    // { headerName: 'Action', field: 'action' },
  ];


  //Traking Info Header
  //Grid headers
  columnDefsTrakingInfo = [
    { headerName: 'Ticket', field: 'shipment_ticket', width: 200, sortable: true, filter: true },
    { headerName: 'Type', field: 'shipment_service_type', width: 100, sortable: true },
    { headerName: 'Date', field: 'create_date', width: 100, sortable: true },
    { headerName: 'Time', field: 'create_time', width: 100, sortable: true },
    { headerName: 'Tracking event', field: 'code_text', width: 250, sortable: true },
    {
      headerName: 'Signature',
      cellRenderer: this.customCellSignatureFunc,
      width: 150
    },
    {
      headerName: 'Picture',
      cellRenderer: this.customCellPictureFunc,
      width: 250
    }
  ];


  modules = AllCommunityModules;

  constructor(
    private spinerService: NgxSpinnerService,
    private sidenavleftservice: SidenavLeftService,
    private toastr: ToastrService,
    private dashboardService: DashboardService,
    private formBuilder: FormBuilder,
    dateTimeAdapter: DateTimeAdapter<any>
  ) {
    if (this.getCountrtTime.env.country_code.toLowerCase() == 'us' || this.getCountrtTime.env.country_code.toLowerCase() == 'usa') {
      dateTimeAdapter.setLocale('us');
    } else {
      dateTimeAdapter.setLocale('en-IN');
    }
    this.defaultColDef = { resizable: true };
    this.overlayLoadingTemplate =
      '<span style="color:#33225A;font-size:14px;font-weight:bold;" class="ag-overlay-loading-center">Loading Tracking Data ....</span>';

  }

  ngOnInit() {
    //Delivery Form Validation
    this.deliverFormVal = this.formBuilder.group({
      contact_person: ['', Validators.required],
      deliver_comment: ['', Validators.required],
      deliver_date_time: ['', Validators.required]
    });

    //Carded Form Validation
    this.cardedFormVal = this.formBuilder.group({
      carded_status: ['', Validators.required],
      driver_comment: ['', Validators.required],
      carded_date_time: ['', Validators.required]
    });

    //Driver Assign Form Validation
    this.assignDriverFormVal = this.formBuilder.group({
      route_name: [''],
      driver_id: ['', Validators.required],
      assign_date_time: ['', Validators.required]
    });
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

      this.showHideModal = 'none';
      document.querySelector(".modal-backdrop").remove();

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

          if (decodeBAse64.status == 'error') {
            this.toastr.error(decodeBAse64.message, '', {
              closeButton: true, positionClass: 'toast-top-right', timeOut: 4000
            });
          } else {
            this.toastr.success('Job Cancelled Sucessfully', '', {
              closeButton: true, positionClass: 'toast-top-right', timeOut: 4000
            });
          }

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

      this.showHideModal = 'none';
      document.querySelector(".modal-backdrop").remove();

      this.dashboardService.loadDropOnMapsEmit();////For Realtime Data
      var myStr = val;
      var strArray = myStr.split(".");
      var decodeBAse64 = JSON.parse(atob(strArray[1]));
      if (decodeBAse64.status == 'error') {
        this.toastr.error(decodeBAse64.message, '', {
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

    this.submittedAssign = true;

    if (this.assignDriverFormVal.invalid) {
      return;
    }

    if (this.assignDriverFormModel.driver_id == 0) {
      this.toastr.info('Invalid Driver', '', {
        closeButton: true, positionClass: 'toast-top-right', timeOut: 4000
      });
      return;
    }

    this.spinerService.show("driverAssign", {
      type: "line-scale-party",
      size: "large",
      color: "white"
    });

    this.sidenavleftservice.sameDayAssignedRoute(this.assignDriverFormModel, this.tmpRouteName).subscribe(val => {

      this.showHideModal = 'none';
      document.querySelector(".modal-backdrop").remove();

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
      this.assignDriverFormModel = {};
    });

  }

  onSelectionChanged(event) { //When select check box from grid
    this.releaseShipmentTkt = event.api.getSelectedRows();
    this.resetDisputed = { action_id: 0 }; //Reset Disputed Dropdown
    this.resetAssignRoute = { shipment_route_id: 0 };
  }

  //Release shipment
  processReleaseShipment() {


    if (this.releaseShipmentTkt.length > 0) { //If selected
      this.spinerService.show("releasejob", {
        type: "line-scale-party",
        size: "large",
        color: "white"
      });

      for (var i = 0; i < this.releaseShipmentTkt.length; i++) {
        this.rlsTktList.push(this.releaseShipmentTkt[i].shipment_ticket);
      }
      this.shipRouteId = '' + this.releaseShipmentTkt[0].shipment_routed_id;
      //releaselJob
      this.sidenavleftservice.releaselJob(this.rlsTktList, this.shipRouteId).subscribe(res => {

        this.showHideModal = 'none';
        document.querySelector(".modal-backdrop").remove();


        this.dashboardService.loadDropOnMapsEmit();////For Realtime Data
        var strArray = res.split(".");
        var decodeBAse64 = JSON.parse(atob(strArray[1]));

        this.toastr.success(decodeBAse64.message, '', {
          closeButton: true, positionClass: 'toast-top-right', timeOut: 4000
        });

        this.spinerService.hide("releasejob");
      })
    } else {
      this.toastr.warning('Please select shipment', '', {
        closeButton: true, positionClass: 'toast-top-right', timeOut: 2000
      });
    }
  }

  //Carded Job
  onClickCarded() {
    this.submittedCard = true;
    if (this.cardedFormVal.invalid) {
      return;
    }

    if (this.releaseShipmentTkt.length > 0 && Object.keys(this.cardedFormModel).length > 0) { //If selected
      this.spinerService.show("carded", {
        type: "line-scale-party",
        size: "large",
        color: "white"
      });

      for (var i = 0; i < this.releaseShipmentTkt.length; i++) {
        this.cradedTktList.push(this.releaseShipmentTkt[i].shipment_ticket);
      }
      this.shipRouteId = '' + this.releaseShipmentTkt[0].shipment_routed_id;
      //releaselJob
      this.sidenavleftservice.cardedJob(this.cradedTktList, this.shipRouteId, this.cardedFormModel).subscribe(res => {


        this.showHideModal = 'none';
        document.querySelector(".modal-backdrop").remove();

        this.cardedFormModel = {}; //Reset Form Model

        this.dashboardService.loadDropOnMapsEmit();////For Realtime Data
        var strArray = res.split(".");
        var decodeBAse64 = JSON.parse(atob(strArray[1]));

        this.toastr.success(decodeBAse64.message, '', {
          closeButton: true, positionClass: 'toast-top-right', timeOut: 4000
        });

        this.spinerService.hide("carded");
      })
    } else {
      this.toastr.error('Form value required!', '', {
        closeButton: true, positionClass: 'toast-top-right', timeOut: 2000
      });
    }
  }


  /**
   * Deliver Job
   */
  onClickDeliver() {
    this.submittedDelV = true;
    if (this.deliverFormVal.invalid) {
      return;
    }

    if (this.releaseShipmentTkt.length > 0 && Object.keys(this.deliverFormModel).length > 0) { //If selected
      this.spinerService.show("deliverJob", {
        type: "line-scale-party",
        size: "large",
        color: "white"
      });

      for (var i = 0; i < this.releaseShipmentTkt.length; i++) {
        this.deliverTktList.push(this.releaseShipmentTkt[i].shipment_ticket);
      }
      this.shipRouteId = '' + this.releaseShipmentTkt[0].shipment_routed_id;
      //releaselJob
      this.sidenavleftservice.deliverJob(this.deliverTktList, this.shipRouteId, this.deliverFormModel).subscribe(res => {

        this.showHideModal = 'none';
        document.querySelector(".modal-backdrop").remove();

        this.deliverFormModel = {}; //Reset Form Model

        this.dashboardService.loadDropOnMapsEmit();////For Realtime Data
        var strArray = res.split(".");
        var decodeBAse64 = JSON.parse(atob(strArray[1]));

        this.toastr.success(decodeBAse64.message, '', {
          closeButton: true, positionClass: 'toast-top-right', timeOut: 4000
        });

        this.spinerService.hide("deliverJob");
      })
    } else {
      this.toastr.error('Form value required!', '', {
        closeButton: true, positionClass: 'toast-top-right', timeOut: 2000
      });
    }
  }

  /**
   * create and download pdf
   */
  downloadExportCageSheet() {

    this.spinerService.show("gen-pdf", {
      type: "line-scale-party",
      size: "large",
      color: "white"
    });
    this.sidenavleftservice.getCasgePDFData(this.shipment_route_id).subscribe(res => {

      var strArray = res.split(".");
      var decodeBAse64 = JSON.parse(atob(strArray[1]));
      if (decodeBAse64.run_sheet_data.length > 0) {
        this.spinerService.hide("gen-pdf");
        this.createPdf(decodeBAse64).subscribe(pdfData => {
          this.pdf = pdfMake;
          this.pdf.createPdf(pdfData).open();
          this.pdf.createPdf(pdfData).download(decodeBAse64.route_name + '.pdf');
          this.pdf.createPdf(pdfData).print();
        });
      } else {
        this.toastr.info('No data is avaible', '', {
          closeButton: true, positionClass: 'toast-top-right', timeOut: 2000
        });
      }
    })
  }

  /**
   * Create HTML data for PDF
   * @param pdfData 
   */
  createPdf(pdfData): Observable<any> {
    var documentDefinition = {
      header: {
        margin: 10,
        columns: [{
          fontSize: 10,
          bold: false,
          text: 'Route Name - ' + pdfData.route_name,
          alignment: 'justify',
          margin: [10, 0, 0, 0],
        },
        {
          fontSize: 18,
          bold: true,
          alignment: 'center',
          margin: [10, 0, 0, 0],
          text: 'Cage Check Sheet'
        },
        {
          fontSize: 10,
          bold: true,
          text: '',
          alignment: 'right',
          margin: [10, 0, 0, 0],
        }
        ]
      },
      footer: function (page, pages) {
        return {
          columns: [{
            alignment: 'right',
            text: [{
              text: page.toString(),
              italics: true
            },
              ' of ',
            {
              text: pages.toString(),
              italics: true
            }
            ]
          }],
          margin: [10, 0]
        };
      },
      content: [
        {
          style: 'tableExample',
          color: '#444',
          table: {
            headerRows: 2,
            widths: ['auto', 'auto', 'auto', 'auto', 50, 'auto', 'auto', 150, "auto", "auto"],
            body: [
              [{
                text: 'S.No',
                style: 'tableHeader',
                alignment: 'center'
              }, {
                text: 'Drop Order',
                style: 'tableHeader',
                alignment: 'center'
              }, {
                text: 'Docket No',
                style: 'tableHeader',
                alignment: 'center'
              }, {
                text: 'Address 1',
                style: 'tableHeader',
                alignment: 'center'
              }, {
                text: 'Postcode',
                style: 'tableHeader',
                alignment: 'center'
              }, {
                text: 'Exp. Item(S)',
                style: 'tableHeader',
                alignment: 'center'
              }, {
                text: 'Exp. Delivery Date',
                style: 'tableHeader',
                alignment: 'center'
              }, {
                text: 'Order Number',
                style: 'tableHeader',
                alignment: 'center'
              }, {
                text: 'Sku Number',
                style: 'tableHeader',
                alignment: 'center'
              }, {
                text: 'Received Item(S)',
                style: 'tableHeader',
                alignment: 'center'
              }],
            ]
          }
        }
      ],
      pageSize: 'A3',
      styles: {
        header: {
          fontSize: 18,
          bold: false,
          margin: [0, 0, 0, 10]
        },
        subheader: {
          fontSize: 16,
          bold: false,
          margin: [0, 10, 0, 5]
        },
        tableExample: {
          margin: [0, 5, 0, 15]
        },
        tableHeader: {
          bold: false,
          fontSize: 8,
          color: 'black'
        }
      }
    };
    //Push PDF data to table
    for (var i = 0; i < pdfData.run_sheet_data.length; i++) {
      let items = pdfData.run_sheet_data[i];
      var orderNumber = ((items.customer_reference1) ? items.customer_reference1 : '');
      var skuNumber = ((items.customer_reference2) ? items.customer_reference2 : '');
      documentDefinition.content[0].table.body.push([i + 1, items.icargo_execution_order, items.instaDispatch_docketNumber, items.address_line1, items.shipment_postcode, items.shipment_total_item, items.shipment_required_service_date, orderNumber, skuNumber, ""]);
    }

    return Observable.create(observer => {
      observer.next(documentDefinition);
      observer.complete();
    });

  }

  /**
   * Used OnlyFor validation
   */
  validateDeliverShipment() {
    if (!this.releaseShipmentTkt.length) {
      this.toastr.warning('Please select shipment', '', {
        closeButton: true, positionClass: 'toast-top-right', timeOut: 2000
      });
    }
  }

  /**
  * Used OnlyFor validation
  */
  validateCardedShipment() {
    if (!this.releaseShipmentTkt.length) {
      this.toastr.warning('Please select shipment', '', {
        closeButton: true, positionClass: 'toast-top-right', timeOut: 2000
      });
    }
  }

  sendToDisputed(disputed_id) {
    if (!this.releaseShipmentTkt.length) {
      this.toastr.warning('Please select shipment', '', {
        closeButton: true, positionClass: 'toast-top-right', timeOut: 2000
      });
      return '';
    } else {
      if (disputed_id == 0) {
        this.toastr.info('Invalid Selection', '', {
          closeButton: true, positionClass: 'toast-top-right', timeOut: 2000
        });
        return '';
      }
    }


    this.submittedDelV = true;

    if (this.releaseShipmentTkt.length > 0) { //If selected
      this.spinerService.show("disputedjob", {
        type: "line-scale-party",
        size: "large",
        color: "white"
      });

      for (var i = 0; i < this.releaseShipmentTkt.length; i++) {
        this.deliverTktList.push(this.releaseShipmentTkt[i].shipment_ticket);
      }


      //disputed job
      this.sidenavleftservice.disputedJob(this.deliverTktList, disputed_id, this.booking_type).subscribe(res => {

        this.showHideModal = 'none';
        document.querySelector(".modal-backdrop").remove();

        this.deliverFormModel = {}; //Reset Form Model

        this.dashboardService.loadDropOnMapsEmit();////For Realtime Data
        var strArray = res.split(".");
        var decodeBAse64 = JSON.parse(atob(strArray[1]));

        this.toastr.success(decodeBAse64.actions.message, '', {
          closeButton: true, positionClass: 'toast-top-right', timeOut: 4000
        });
        this.spinerService.hide("disputedjob");
      })
    }
  }


  moveToAssignRoute(shipmentRouteId) {
    if (!this.releaseShipmentTkt.length) {
      this.toastr.warning('Please select shipment', '', {
        closeButton: true, positionClass: 'toast-top-right', timeOut: 2000
      });
      return '';
    } else {
      if (shipmentRouteId == 0) {
        this.toastr.info('Invalid Selection', '', {
          closeButton: true, positionClass: 'toast-top-right', timeOut: 2000
        });
        return '';
      }
    }


    this.submittedDelV = true;

    if (this.releaseShipmentTkt.length > 0) { //If selected
      this.spinerService.show("assignRoute", {
        type: "line-scale-party",
        size: "large",
        color: "white"
      });

      for (var i = 0; i < this.releaseShipmentTkt.length; i++) {
        this.deliverTktList.push(this.releaseShipmentTkt[i].shipment_ticket);
      }


      //disputed job
      this.sidenavleftservice.movetoReAssign(this.deliverTktList, shipmentRouteId).subscribe(res => {


        this.showHideModal = 'none';
        document.querySelector(".modal-backdrop").remove();

        this.deliverFormModel = {}; //Reset Form Model
        this.dashboardService.loadDropOnMapsEmit();////For Realtime Data
        var strArray = res.split(".");
        var decodeBAse64 = JSON.parse(atob(strArray[1]));

        this.toastr.success(decodeBAse64.message, '', {
          closeButton: true, positionClass: 'toast-top-right', timeOut: 4000
        });
        this.spinerService.hide("assignRoute");
      }, err => {
        console.log(err);
        this.spinerService.hide("assignRoute");
      })
    }
  }

  //Return signature
  customCellSignatureFunc(param) {
    if (param.data.podPath.length > 0) {
      for (var i = 0; i < param.data.podPath.length; i++) {
        if (param.data.podPath[i].pod_name == 'signature') {
          if (param.data.podPath[i].pod_path) {
            return '<a href="' + param.data.podPath[i].pod_path + '" target="_blank"><img src="' + param.data.podPath[i].pod_path + '" height="50" width="50"></a>';
          } else {
            return '';
          }
        }
      }
    } else {
      return '';
    }
  }

  //Return Picture
  customCellPictureFunc(param) {
    if (param.data.podPath.length > 0) {
      for (var i = 0; i < param.data.podPath.length; i++) {
        if (param.data.podPath[i].pod_name == 'picture') {
          if (param.data.podPath[i].pod_path) {
            return '<a href="' + param.data.podPath[i].pod_path + '" target="_blank"><img src="' + param.data.podPath[i].pod_path + '" height="50" width="50"></a>';
          } else {
            return '';
          }
        }
      }
    } else {
      return '';
    }
  }

  //get Traking Info by on click on traking tab
  getTrakingInfo(e, data) {

    if (e.index == 1 && e.tab.textLabel == 'Tracking' && !this.trakingCallStatus) {

      this.gridApi.showLoadingOverlay();
      this.rowDataTrakingInfo = '';//Reset Traking Info row data
      var Jtypes = data.booking_type.toLowerCase();
      if (Jtypes == 'next' || Jtypes == 'same' || Jtypes == 'vendor') {
        this.sidenavleftservice.getShipmentTrakingInfo(data.instaDispatch_loadIdentity, data.is_internal, data.booking_type).subscribe(resp => {
          var strArray = resp.split(".");
          this.trakingCallStatus = true;
          var decodeBAse64 = JSON.parse(atob(strArray[1]));
          if (Jtypes == 'next') {
            this.rowDataTrakingInfo = decodeBAse64.nextday.trackinginfo;
          } else if (Jtypes == 'same') {
            this.rowDataTrakingInfo = decodeBAse64.sameday.trackinginfo;
          }else if(Jtypes == 'vendor'){
            this.rowDataTrakingInfo = decodeBAse64.retail.trackinginfo;
          }
        });
      }
    }
  }

  //Show grid loader while fetch tracking data
  onGridReadyTracking(params) {
    this.gridApi = params.api;
  }

  /**
   * Download and create pod label
   */
  downloadPodLabel() {
    if (this.customerAccountNumber && this.loadIdentity) {
      this.spinerService.show("podlabel", {
        type: "line-scale-party",
        size: "large",
        color: "white"
      });
      
      this.sidenavleftservice.getPodLabel(this.customerAccountNumber, this.loadIdentity, this.booking_type).subscribe(resp => {
        this.spinerService.hide("podlabel");
        var strArray = resp.split(".");
        this.trakingCallStatus = true;
        var decodeBAse64 = JSON.parse(atob(strArray[1]));
        if(decodeBAse64.status == 'success'){
          console.log(decodeBAse64.pod_path);
          //window.location.href = decodeBAse64.pod_path;
          var evt = new MouseEvent('click', {
            'view': window,
            'bubbles': true,
            'cancelable': false
        });
        var save = document.createElement('a');
            save.href = decodeBAse64.pod_path;
            save.target = '_blank';
            var filename = decodeBAse64.pod_path.substring(decodeBAse64.pod_path.lastIndexOf('/')+1);
            save.download = 'test' || filename;
        save.dispatchEvent(evt);
        (window.URL).revokeObjectURL(save.href);
        }
      },
      error => {
        this.spinerService.hide("podlabel");
        console.log(error);
      },
      );
    }
  }

}
