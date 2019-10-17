import { Component, OnInit, ViewEncapsulation } from '@angular/core';

import { HeaderService } from './header.service';
import { Header } from './header.model';




@Component({
  selector: 'app-header',
  templateUrl: './header.component.html',
  styleUrls: ['./header.component.css'],
  encapsulation: ViewEncapsulation.None,
})
export class HeaderComponent implements OnInit {

  header:Header= new Header();
  
  constructor(private headerService:HeaderService) {
    
   }

  
  ngOnInit() {
    this.headerService.getHeaderDataListen(this);
  }
  isShown:Boolean=false;
  toggleShow() {

  this.isShown = ! this.isShown;
    
  }

}
