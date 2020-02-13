import { Component, Inject, OnInit } from '@angular/core';
import { VERSION, MatDialogRef, MatDialog, MatSnackBar, MAT_DIALOG_DATA } from '@angular/material';
import { FilterService } from './filter.service';
import { FormGroup, FormBuilder, Validators, FormControl } from '@angular/forms';
import { NgxSpinnerService } from 'ngx-spinner';
import { ToastrService } from 'ngx-toastr';
import { DashboardService } from 'src/app/dashboard/dashboard.service';
import { SharedService } from 'src/app/shared/shared.service';
import { retry } from 'rxjs/operators';


@Component({
  selector: 'filter-dialog',
  templateUrl: 'filter-dialog.html',
})
export class FilterDialog implements OnInit {
  message: string = "Are you sure?"
  confirmButtonText = "Yes"
  cancelButtonText = "Cancel"
  deleteFilterBtnText = 'Delete Filter';
  filterBtnTxt = "Set Filter";

  filterFormVal: FormGroup;
  filterFormModel: any = {};
  hubFilterFormModel: any = [];
  deleteBtnStatus;
  jobStatusMsg: string;
  jobTypeMsg: string;
  hubData: any = [];
  checked = true;

  hubSelectList = new FormControl();

  constructor(
    @Inject(MAT_DIALOG_DATA) private data: any,
    private dialogRef: MatDialogRef<FilterDialog>,
    private filterService: FilterService,
    private formBuilder: FormBuilder,
    private spinerService: NgxSpinnerService,
    private toastr: ToastrService,
    private dashboardService: DashboardService,
    private sharedService: SharedService
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
    this.sharedService.filterDialogCmpShared = this;
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
      hubs: ''
    });
  }


  /**
   * Save Filter Data
   */
  saveFilter() {
    //Check For Validation
    if (this.filterFormModel.unassigned || this.filterFormModel.assign || this.filterFormModel.completed) {
      this.jobStatusMsg = '';
      if (this.filterFormModel.collection || this.filterFormModel.delivery) {
        this.jobTypeMsg = '';
      } else {
        this.jobTypeMsg = 'Please Select Job Type';
        return;
      }
    } else {
      this.jobStatusMsg = 'Please Select Job Status';
      return;
    }



    this.spinerService.show("save-filter", {
      type: "line-scale-party",
      size: "large",
      color: "white"
    });
    this.filterService.saveFilter(this.filterFormModel,this.hubFilterFormModel).subscribe(val => {
      var re = JSON.parse(val);
      this.spinerService.hide("save-filter");
      this.dashboardService.loadDropOnMapsEmit();
      if (re.message.status = 'sucess') {
        this.toastr.success(re.message.message, '', {
          closeButton: true, positionClass: 'toast-top-right', timeOut: 4000
        });
      } else {
        this.toastr.error('Something Error occured', '', {
          closeButton: true, positionClass: 'toast-top-right', timeOut: 4000
        });
      }
      this.dialogRef.close(); //Close modal
      //Remove Route Direction Live After filter Data Saved
      this.sharedService.dashbrdCmpShared.removeDirectionalRouteLineFromMap();
    });
  }


  getFilterData() {
    this.spinerService.show("get-filter", {
      type: "line-scale-party",
      size: "large",
      color: "white"
    });
    this.filterService.getFilterRecord().subscribe(val => {
      var re = JSON.parse(val);
      this.spinerService.hide("get-filter");
      if (re.data.length > 0) {
        if (re.data[0].hub_filter) {
          var objectHub = JSON.parse(re.data[0].hub_filter);
          this.hubFilterFormModel = objectHub;
        }
        if (re.data[0].drop_filter) {
          var object = JSON.parse(re.data[0].drop_filter);
          this.filterFormModel = object;
          this.deleteBtnStatus = false;
        } else {
          this.deleteBtnStatus = true;
        }
      } else {
        this.deleteBtnStatus = true;
      }
    });
  }

  deleteFilter() {
    if (this.deleteBtnStatus) { return '' };

    this.spinerService.show("delete-filter", {
      type: "line-scale-party",
      size: "large",
      color: "white"
    });
    this.filterService.deleteFilter().subscribe(val => {
      var re = JSON.parse(val);
      this.dashboardService.loadDropOnMapsEmit();//Load Data on map click
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
    this.dialogRef.close();//Close modal
    //Remove Route Direction Live After filter data delete
    this.sharedService.dashbrdCmpShared.removeDirectionalRouteLineFromMap();
  }

  checkedFiterStatus() {
    //this.filterFormModel.drops
    if (!this.filterFormModel.drops) {
      this.filterFormModel = JSON.parse('{"drops":false,"unassigned":false,"assign":false,"completed":false,"collection":false,"delivery":false}');
    }
  }

  //Get List of hub
  listenWhenGetHubList() {
    this.hubData = this.filterService.hubData;
  }

  //Make Selected checkbox based on saved Filterhub
  compareFn(o1: any, o2: any): boolean {
    //console.log(o1.id + '--' + o2.id);
    if (o1.id === o2.id)
      return true;
    else return false
  }

}