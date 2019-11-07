import { Injectable } from '@angular/core';
import { config } from 'src/config/config';
import { SocketService } from '../commonServices/socket.service';
import * as mapboxgl from 'mapbox-gl';

@Injectable({
  providedIn: 'root'
})
export class DashboardService {

  configSettings = new config();
  companyId = this.configSettings.env.company_id;
  wairehouseId = this.configSettings.env.wairehouse_id;
  public markerList:any=new Array();

  //socket;
  notiFicationResponce;


  
  constructor(private socket:SocketService) { 
    this.loadDropOnMapsEmit();
    mapboxgl.accessToken = 'pk.eyJ1IjoiaW5zdGFkaXNwYXRjaCIsImEiOiJjazJvajJueWwwNjlmM2dwcHMxbTFiMHl0In0.9eyVqMCN3WIodGdslgQ1hA';
  }

  loadDropOnMapsListen(){
    this.socket.websocket.on('get-all-drops',(data)=>{
        this.markerList=data.shipment_data;
    });
  }

  loadDropOnMapsEmit(){
    this.socket.websocket.emit('req-all-drops', { search_date: '', warehouse_id:this.wairehouseId,company_id:this.companyId});
  }


  getMarkers() {
      const geoJson = [{
        'type': 'Feature',
        'geometry': {
          'type': 'Point',
          'coordinates': ['80.20929129999999', '13.0569951']
        },
        'properties': {
          'message': 'Chennai'
        }
      }, {
        'type': 'Feature',
        'geometry': {
          'type': 'Point',
          'coordinates': ['77.350048', '12.953847' ]
        },
        'properties': {
          'message': 'bangulare'
        }
      }];
      return geoJson;
    }
}
