import { Injectable } from '@angular/core';
import { config } from 'src/config/config';
import { getInterpolationArgsLength } from '@angular/compiler/src/render3/view/util';
declare var mapboxgl:any;



@Injectable({
  providedIn: 'root'
})
export class MapboxService {
  public map:any;
  spiderfier:any;

  constructor() {
    
    mapboxgl.accessToken = (new config()).env.mapbox_api_key;
    
   }
   public initMap(){
    //get Wairehouse lat long
    this.getLatLng();
    this.map=new mapboxgl.Map({
      container: 'map',
      style: 'mapbox://styles/instadispatch/ck3ps5h4n1e9r1co0e7wctvhz',
      zoom: 10,
      center: [-1.27945500000000000000, 51.75343480000000000000],
      });
      this.map.addControl(new mapboxgl.NavigationControl());
   }

   getLatLng() {
     console.log('test');
   }
}