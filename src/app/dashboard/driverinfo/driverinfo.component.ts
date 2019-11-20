import { Component, OnInit } from '@angular/core';

@Component({
  selector: 'app-driverinfo',
  templateUrl: './driverinfo.component.html',
  styleUrls: ['./driverinfo.component.css']
})
export class DriverinfoComponent implements OnInit {

  message: string = "Are you sure?"
  confirmButtonText = "Yes"
  cancelButtonText = "Cancel"

  
  constructor() { }

  ngOnInit() {
  }

}
