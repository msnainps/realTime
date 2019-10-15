import { Component, OnInit } from '@angular/core';

@Component({
  selector: 'app-dashboard',
  templateUrl: './dashboard.component.html',
  styleUrls: ['./dashboard.component.css']
})
export class DashboardComponent implements OnInit {

  constructor() { }

  ngOnInit() {
  }
  status: boolean = false;
  status2: boolean = false;

  addClass(){
    this.status = !this.status;  
 
  }
  addClass2(){
    this.status2 = !this.status;  
 
  }

}
