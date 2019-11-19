import { Injectable } from '@angular/core';
import { config } from 'src/config/config';
declare var mapboxgl:any;


@Injectable({
  providedIn: 'root'
})
export class MapboxService {
  public map:any;

  constructor() {
    mapboxgl.accessToken = (new config()).env.mapbox_api_key;
   
   }
   public initMap(){
    this.map=new mapboxgl.Map({
      container: 'map',
      style: 'mapbox://styles/instadispatch/ck2u7n91p3kvq1cp30yrc0uz5',
      zoom: 8,
      center: [-1.27945500000000000000, 51.75343480000000000000],
      });
      this.map.addControl(new mapboxgl.NavigationControl());
   }
}