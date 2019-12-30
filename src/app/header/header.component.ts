import { Component, OnInit, ViewEncapsulation } from '@angular/core';

import { HeaderService } from './header.service';
import { Header } from './header.model';
import { config } from 'src/config/config';
import { DateTimeAdapter } from 'ng-pick-datetime';
import { AllCommunityModules } from '@ag-grid-community/all-modules';
import { ToastrService } from 'ngx-toastr';
import { formatDate } from '@angular/common';
import { NgxSpinnerService } from 'ngx-spinner';
 






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
    { headerName: 'Action', field: 'action' },
  ];


  modules = AllCommunityModules;
  constructor(private headerService: HeaderService, dateTimeAdapter: DateTimeAdapter<any>, private toastr: ToastrService,private spinerService: NgxSpinnerService) {
    if (this.configSettings.env.country_code.toLowerCase() == 'us' || this.configSettings.env.country_code.toLowerCase() == 'usa') {
      dateTimeAdapter.setLocale('us');
    } else {
      dateTimeAdapter.setLocale('en-IN');
    }
    this.headreSearch.searchdate = new Date();
    this.headreSearch.searchvalue = '';
    this.defaultColDef = { resizable: true };
    this.paginationPageSize = 15;
  }


  ngOnInit() {
    //this.headerService.getHeaderDataListen(this);
  }
  isShown: Boolean = false;
  toggleShow() {

    //this.isShown = ! this.isShown;

  }

  redirectTOHome() {
    window.open(this.configSettings.env.icargo_url, "_blank");
  }

  getSearchRecord() {
    this.spinerService.show("header-search", {
      type: "line-scale-party",
      size: "large",
      color: "white"
    });

    this.rowData = '';
    var searchFileds = this.headreSearch;

    if(!this.headreSearch.searchvalue){
      this.toastr.error('search value is required !', '', {
        closeButton: true, positionClass: 'toast-top-right', timeOut: 4000
      });
      //this.searchedDate = '';
      this.searchedValue = '';
      this.spinerService.hide('header-search');
      return ''
    }
   
    

    this.searchedDate = formatDate(new Date(searchFileds.searchdate), 'dd-MM-yyyy', 'en-US', '+0530');
    this.searchedValue = searchFileds.searchvalue;

    this.headerService.getSearchResult(this.headreSearch).subscribe(val => {
      this.spinerService.hide('header-search');
      var data: any = JSON.parse(val);
      if (Object.keys(data.message).length === 0) {
        this.rowData = '';
      } else {
        this.rowData = data.message;
      }
    });
    this.headreSearch.searchvalue = '';
    this.headreSearch.searchdate = new Date();
    
    
  }


}
