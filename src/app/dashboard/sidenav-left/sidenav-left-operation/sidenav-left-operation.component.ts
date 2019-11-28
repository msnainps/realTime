import { Component, OnInit } from '@angular/core';
import { NgxSpinnerService } from 'ngx-spinner';
import { SidenavLeftService } from '../sidenav-left.service';
import { ToastrService } from 'ngx-toastr';



@Component({
  selector: 'app-sidenav-left-operation', //This component is added in dashboard.component.html
  templateUrl: './sidenav-left-operation.component.html',
  styleUrls: ['./sidenav-left-operation.component.css']
})
export class SidenavLeftOperationComponent implements OnInit {

  shipment_ticket: any;
  spiner_text: string = 'Cancel Job...';
  constructor(private spinerService: NgxSpinnerService, private sidenavleftservice: SidenavLeftService, private toastr: ToastrService) { }

  ngOnInit() {
  }

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

}
