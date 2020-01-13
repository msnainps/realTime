import { Component, OnInit, ViewEncapsulation } from '@angular/core';

import { HeaderService } from './header.service';
import { Header } from './header.model';
import { config } from 'src/config/config';
import { DateTimeAdapter } from 'ng-pick-datetime';
import { AllCommunityModules } from '@ag-grid-community/all-modules';
import { ToastrService } from 'ngx-toastr';
import { formatDate } from '@angular/common';
import { NgxSpinnerService } from 'ngx-spinner';
import { DashboardService } from '../dashboard/dashboard.service';
import { SharedService } from '../shared/shared.service';
declare var document: any;
 






@Component({
  selector: 'app-header',
  templateUrl: './header.component.html',
  styleUrls: ['./header.component.css'],
  encapsulation: ViewEncapsulation.None,
})
export class HeaderComponent implements OnInit {

  configSettings = new config();
  //SHow default date in angular
  headreSearch: any = {};
  header: Header = new Header();
  toaserMsg;
  private defaultColDef;
  selectionMode = 'multiple';
  rowData: any;
  paginationPageSize: any;
  searchedDate;
  searchedValue;
  selectedDateRange = {}
  dateDeleteBtn = false;
  private gridApiSearch;
  overlayLoadingTemplateSearch;
  
  

  //Grid headers
  columnDefs = [
    { headerName: 'Sr. no', field: 'sr_no', width: 50, sortable: true },
    { headerName: 'Docket No', field: 'docket_no', width: 200, sortable: true, filter: true },
    { headerName: 'Reference No', field: 'reference_no', width: 100, sortable: true, filter: true },
    { headerName: 'Service', field: 'service_type', width: 100, sortable: true, filter: true },
    { headerName: 'Service Date', field: 'service_date', width: 100, sortable: true, filter: true },
    { headerName: 'Address1', field: 'address_1', width: 150, sortable: true, filter: true },
    { headerName: 'Postcode', field: 'postcode', width: 120, sortable: true, filter: true },
    { headerName: 'Shipment Ticket', field: 'shipment_ticket', width: 150, sortable: true, filter: true },
    { headerName: 'Route Name', field: 'route_name', width: 100, sortable: true, filter: true },
    { headerName: 'Driver Name', field: 'driver_name', width: 100, sortable: true, filter: true },
    {
      headerName: 'Details',
      cellRenderer: this.viewDetailsFromHeaderSearch,
      width: 150
    }
  ];


  modules = AllCommunityModules;
  constructor(
    private headerService: HeaderService, 
    dateTimeAdapter: DateTimeAdapter<any>, 
    private toastr: ToastrService,
    private spinerService: NgxSpinnerService,
    private dashboardService:DashboardService,
    private sharedService:SharedService
    ) {
    if (this.configSettings.env.country_code.toLowerCase() == 'us' || this.configSettings.env.country_code.toLowerCase() == 'usa') {
      dateTimeAdapter.setLocale('us');
    } else {
      dateTimeAdapter.setLocale('en-IN');
    }
    this.headreSearch.searchdate = new Date();
    this.headreSearch.searchvalue = '';
    this.defaultColDef = { resizable: true };
    this.paginationPageSize = 15;
    this.overlayLoadingTemplateSearch =
      '<span style="color:#33225A;font-size:14px;font-weight:bold;" class="ag-overlay-loading-center">Searching ....</span>';

    document.gridDocThis = this; 
    
  }


  ngOnInit() {
    //this.headerService.getHeaderDataListen(this);
   this.headerService.getHeaderSavedDate().subscribe(resp => {
    
    if(resp.getSavedDate.length){
      this.dateDeleteBtn = true;
       //show saved date
      this.headreSearch.searchdate = [new Date(resp.getSavedDate[0].start_date), new Date(resp.getSavedDate[0].end_date)];
    }else{
      //show todays date
      this.headreSearch.searchdate = [new Date(), new Date()];
    }
  });
  }
  isShown: Boolean = false;
  toggleShow() {

    //this.isShown = ! this.isShown;

  }

  redirectTOHome() {
    window.open(this.configSettings.env.icargo_url, "_blank");
  }

  getSearchRecord() {
    
    //this.rowData = '';
    var searchFileds = this.headreSearch;
    
    if(!this.headreSearch.searchvalue){
      this.toastr.error('search value is required !', '', {
        closeButton: true, positionClass: 'toast-top-right', timeOut: 4000
      });
      //this.searchedDate = '';
      this.searchedValue = '';
      this.spinerService.hide('header-search');
      this.rowData = '';
      this.gridApiSearch.showNoRowsOverlay();
      return ''
    }else{
      this.gridApiSearch.showLoadingOverlay(); 
    }
   
    

    //this.searchedDate = formatDate(new Date(searchFileds.searchdate), 'dd-MM-yyyy', 'en-US', '+0530');
    this.searchedValue = searchFileds.searchvalue;
    this.headerService.getSearchResult(this.headreSearch).subscribe(val => {
      var data: any = JSON.parse(val);
      if (Object.keys(data.message).length === 0) {
        this.rowData = '';
        this.gridApiSearch.showNoRowsOverlay();
      } else {
        this.rowData = data.message;
      }
    });
    this.headreSearch.searchvalue = '';
    //this.headreSearch.searchdate = new Date();
  }

  /**
   * Save header Date
   */
  saveMapDataOnDateSelect(){
    this.selectedDateRange['start_date'] = formatDate(new Date(this.headreSearch.searchdate[0]), 'yyyy-MM-dd', 'en-US', '+0530');
    this.selectedDateRange['end_date'] = formatDate(new Date(this.headreSearch.searchdate[1]), 'yyyy-MM-dd', 'en-US', '+0530');
    //Save Header Data

    this.spinerService.show("header-search", {
      type: "line-scale-party",
      size: "large",
      color: "white"
    });
    this.headerService.saveSearchDate(this.selectedDateRange).subscribe(resp => {
      this.dateDeleteBtn = true;
      this.spinerService.hide('header-search');
      this.dashboardService.loadDropOnMapsEmit();
    });

    
  }


  /**
   * Delete Header Date
   */
  deleteHeaderDate(){
    this.spinerService.show("header-search", {
      type: "line-scale-party",
      size: "large",
      color: "white"
    });
    this.headerService.deleteSearchDate().subscribe(resp => {
      this.dateDeleteBtn = false;
      this.spinerService.hide('header-search');
       //show todays date
      this.headreSearch.searchdate = [new Date(), new Date()]; 
      this.dashboardService.loadDropOnMapsEmit();
    });
  }

   //Show grid loader while fetch tracking data
   onGridReadySearching(params){
    this.gridApiSearch = params.api;
   }

   //Open View Details from header search
   viewDetailsFromHeaderSearch(viewDetailsClick){
     console.log(viewDetailsClick);
     var viewDetails =viewDetailsClick.data.instaDispatch_loadIdentity;
     return '<a href="" onclick="document.gridDocThis.showViewDetails(\'' + viewDetails + '\')" data-toggle="modal" data-target="#Modal4">View Details</a>'
   }

   showViewDetails(loadIdentity){

    this.headerService.getParcelTktInfo(loadIdentity).subscribe(resp => {
      console.log(resp);
      console.log(this.sharedService);
      //console.log(this.sideNavLeft.viewDetails(resp.getParcelData[0],resp.getParcelData[0].drop_type));
      //document.gridDocThis.sideNavLeft.viewDetails(resp.getParcelData[0],resp.getParcelData[0].drop_type);
    });
   }
   
  
}
