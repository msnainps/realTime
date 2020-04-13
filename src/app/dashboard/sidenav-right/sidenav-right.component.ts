import { Component, OnInit } from '@angular/core';

@Component({
  selector: 'app-sidenav-right',
  templateUrl: './sidenav-right.component.html',
  styleUrls: ['./sidenav-right.component.css']
})
export class SidenavRightComponent implements OnInit {

  constructor() { }

  ngOnInit() {
  }

  displayedColumns =
  ['driver', 'position', 'weight', 'symbol', 'position', 'weight', 'symbol' ,'symbol2'];
dataSource = ELEMENT_DATA;

}
export interface PeriodicElement {
  name: string;
  position: string;
  weight: string;
  symbol: string;
  symbol2?: string;
}

const ELEMENT_DATA: PeriodicElement[] = [
  {position: '-', name: 'Panakj', weight:'-', symbol: '-'},
  {position: '-', name: 'Pankaj', weight: '-', symbol: '-'},
  {position: '-', name: 'Chauhan', weight: '-', symbol: '-'},
  {position: '-', name: 'xyz', weight: '-', symbol: '-'},
  {position: '-', name: 'Bill', weight: '-', symbol: '-'},
  {position: '-', name: 'asdasdas', weight: '-', symbol: '-'},
  {position: '-', name: 'adadsasdadad', weight: '-', symbol: '-'},
  {position: '-', name: 'adadasdad', weight: '-', symbol: '-'},
  {position: '-', name: 'Fluorine', weight: '-', symbol: '-'},
  {position: '-', name: 'Neon', weight: '-', symbol: '-'},

];