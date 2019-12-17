import { Component, Inject, OnInit } from '@angular/core';
import { VERSION, MatDialogRef, MatDialog, MatSnackBar, MAT_DIALOG_DATA } from '@angular/material';
import { FilterService } from './filter.service';
import { FormGroup, FormBuilder, Validators } from '@angular/forms';
import { NgxSpinnerService } from 'ngx-spinner';
import { ToastrService } from 'ngx-toastr';
import { DashboardService } from 'src/app/dashboard/dashboard.service';


@Component({
  selector: 'filter-dialog',
  templateUrl: 'filter-dialog.html',
})
export class FilterDialog implements OnInit {
  message: string = "Are you sure?"
  confirmButtonText = "Yes"
  cancelButtonText = "Cancel"
  deleteFilterBtnText = 'delete FIlter';
  filterBtnTxt = "Set Filter";

  filterFormVal: FormGroup;
  filterFormModel: any = {};
  deleteBtnStatus;
  constructor(
    @Inject(MAT_DIALOG_DATA) private data: any,
    private dialogRef: MatDialogRef<FilterDialog>,
    private filterService: FilterService,
    private formBuilder: FormBuilder,
    private spinerService: NgxSpinnerService,
    private toastr: ToastrService,
    private dashboardService:DashboardService
  ) {
    if (data) {
      this.message = data.message || this.message;
      if (data.buttonText) {
        this.confirmButtonText = data.buttonText.ok || this.confirmButtonText;
        this.cancelButtonText = data.buttonText.cancel || this.cancelButtonText;
      }
    }
    //When Click on Filter Button
    this.getFilterData();
  }

  ngOnInit() {
    this.filterFormVal = this.formBuilder.group({
      drops: '',
      collection: '',
      delivery: '',
      unassigned: '',
      assign: '',
      completed: '',
      driver: '',
      online: '',
      offline: '',
      ideal: '',
    });
  }


  /**
   * Save Filter Data
   */
  saveFilter() {
    this.spinerService.show("save-filter", {
      type: "line-scale-party",
      size: "large",
      color: "white"
    });
    this.filterService.saveFilter(this.filterFormModel).subscribe(val => {
      var re = JSON.parse(val);
      this.spinerService.hide("save-filter");
      if (re.message.status = 'sucess') {
        this.toastr.success(re.message.message, '', {
          closeButton: true, positionClass: 'toast-top-right', timeOut: 4000
        });
      } else {
        this.toastr.error('Something Error occured', '', {
          closeButton: true, positionClass: 'toast-top-right', timeOut: 4000
        });
      }

     this.dashboardService.loadDropOnMapsEmit();//Load Data on map click
    });
  }


  getFilterData() {
    this.filterService.getFilterRecord().subscribe(val => {
      var re = JSON.parse(val);
      if (re.data.length > 0) {
        if (re.data[0].drop_filter) {
          var object = JSON.parse(re.data[0].drop_filter);
          this.filterFormModel = object;
          this.deleteBtnStatus = false;
        }else{
          this.deleteBtnStatus = true;
        }
      }else{
      this.deleteBtnStatus = true;
      }
    });
  }

  deleteFilter(){
    if(this.deleteBtnStatus){return ''};

    this.spinerService.show("delete-filter", {
      type: "line-scale-party",
      size: "large",
      color: "white"
    });
    this.filterService.deleteFilter().subscribe(val => {
      var re = JSON.parse(val);
      console.log(re);
      this.spinerService.hide("delete-filter");
      if (re.message.status = 'sucess') {
        this.toastr.success(re.message.message, '', {
          closeButton: true, positionClass: 'toast-top-right', timeOut: 4000
        });
      } else {
        this.toastr.error('Something Error occured', '', {
          closeButton: true, positionClass: 'toast-top-right', timeOut: 4000
        });
      }
    });
    this.dashboardService.loadDropOnMapsEmit();//Load Data on map click
  }

}