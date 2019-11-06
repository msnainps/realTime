import { Component, OnInit } from '@angular/core';
import { SidenavLeftService } from './sidenav-left.service';


@Component({
  selector: 'app-sidenav-left',
  templateUrl: './sidenav-left.component.html',
  styleUrls: ['./sidenav-left.component.css']
})
export class SidenavLeftComponent implements OnInit {

  constructor(private sidenaveleftService:SidenavLeftService) { }

  ngOnInit() {
    this.sidenaveleftService.getAssignDropData();
  }

}
