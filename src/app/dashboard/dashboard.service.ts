import { Injectable } from '@angular/core';
import { config } from 'src/config/config';
import { SocketService } from '../commonServices/socket.service';

@Injectable({
  providedIn: 'root'
})
export class DashboardService {

  configSettings = new config();
  companyId = this.configSettings.env.company_id;
  wairehouseId = this.configSettings.env.wairehouse_id;
  public markerList: any = new Array();

  //socket;
  notiFicationResponce;


  points;
  constructor(private socket: SocketService) {
    this.loadDropOnMapsEmit();

    this.socket.websocket.on('instantnotiFication', (data) => {
      this.notiFicationResponce = data;
      if (this.notiFicationResponce.company_id == this.companyId) { //if responce is same as session user
        this.loadDropOnMapsEmit();
      }

    })
  }

  loadDropOnMapsListen() {
    this.socket.websocket.on('get-all-drops', (data) => {
      this.markerList = data.shipment_data;

      console.log(data.shipment_data);

      //Create geoJson Data for Map=Box

      this.points = {};
      this.points.type = 'FeatureCollection';
      this.points.features = [];

      for (var index1 in data.shipment_data) {
        this.points.features[index1] = {
          'type': 'Feature',
          'properties': {
            'description':
              '<strong>Shipment ID:' + data.shipment_data[index1].shipment_ticket + '</strong></br>\
               <strong>Customer Reference:'+ data.shipment_data[index1].cr + '</strong></br>\
               <strong>Job Type:'+ data.shipment_data[index1].job_type + '</strong></br>\
               <strong>Assign Driver:'+ data.shipment_data[index1].driver_name + '</strong>',
            'icon': data.shipment_data[index1].marker_url,
            'execution_order': data.shipment_data[index1].icargo_execution_order
          },
          'geometry': {
            'type': 'Point',
            'coordinates': [
              data.shipment_data[index1].shipment_longitude, data.shipment_data[index1].shipment_latitude
            ]
          },
        };
      }
      //console.log (this.points);

    });
  }

  loadDropOnMapsEmit() {
    this.socket.websocket.emit('req-all-drops', { search_date: '', warehouse_id: this.wairehouseId, company_id: this.companyId });
  }




}
