import { Component, OnInit } from '@angular/core';
import {MatDialog,MatDialogConfig } from '@angular/material/dialog';
import {FilterDialog} from './filter.dialog.component';
import { FilterService } from './filter.service';


@Component({
  selector: 'app-filter',
  templateUrl: './filter.component.html',
  styleUrls: ['./filter.component.css']
})
export class FilterComponent implements OnInit {

  
  constructor(private dialog: MatDialog,private filterService:FilterService) {
  }

  ngOnInit() {
    this.hubListner();
  }

  openDialog() {
    const dialogRef = this.dialog.open(FilterDialog,{
      data:{
        message: 'Are you sure want to delete?',
        buttonText: {
          ok: 'Set Filter',
          cancel: 'No'
        },
        hubList : this.getHubList()
      }
    });
    
  }

  getHubList(){
   this.filterService.getHubDetails().subscribe(resp => {
      //console.log(resp);
   });
  }

  hubListner(){
    this.filterService.setHubListner(); 
  }
  
  
  

}


