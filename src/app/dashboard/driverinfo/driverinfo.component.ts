import { Component, OnInit, Inject } from '@angular/core';
import { MatDialogRef, MAT_DIALOG_DATA } from '@angular/material';

@Component({
  selector: 'app-driverinfo',
  templateUrl: './driverinfo.component.html',
  styleUrls: ['./driverinfo.component.css']
})
export class DriverinfoComponent implements OnInit {
  
  constructor(@Inject(MAT_DIALOG_DATA) public data:any) {
    //Data Comming from dashboard Component
    //console.log(data);
   }

  ngOnInit() {
  }

}
