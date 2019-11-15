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
  driverGpsInfo = {}
  driverInfo;
  constructor(private socket: SocketService) {
    this.loadDropOnMapsEmit();
    this.loadDriverData();

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

      //Merge assinged and Unassinged data
      
      data.shipment_data.push.apply(data.shipment_data, data.unassgn_shipment_data);
      data.shipment_data.push.apply(data.shipment_data, data.completed_shipment_data)
      //console.log(data);


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
              data.shipment_data[index1].shipment_longitude, 
              data.shipment_data[index1].shipment_latitude
            ]
          }
        };
      }
      
      //console.log (this.points);
    });
    
  }

  loadDropOnMapsEmit() {
    this.socket.websocket.emit('req-all-drops', { search_date: '', warehouse_id: this.wairehouseId, company_id: this.companyId });
  }

  loadDriverData(){
    console.log('driver--Data');
    this.socket.drivergpssocket.on('offline-data-process',driverData => {
      
      var driverDataGps = (JSON.parse(driverData));
      //console.log(driverDataGps);

      if(driverDataGps.source == 'gps-location'){
      //if(driverData.payload.companyId == this.companyId){
        
        if(driverDataGps.payload.companyId == 194){ 
          this.driverGpsInfo[driverDataGps.payload.uid] = driverDataGps.payload
      }
      //console.log(this.driverGpsInfo);
      this.plotDriverOnMap(this.driverGpsInfo);
     }
     
    })
  }


  plotDriverOnMap(driverData){
      this.driverInfo = {};
      this.driverInfo.type = 'FeatureCollection';
      this.driverInfo.features = [];

      for (var index1 in driverData) {
        this.driverInfo.features[index1] = {
          'type': 'Feature',
          "uid":"",
          'properties': {
            'description':
              'driverInfo',
            'icon': 'marker-editor-green',
            'execution_order': 'd'
          },
          'geometry': {
            'type': 'Point',
            'coordinates': [
              driverData[index1].longitude, 
              driverData[index1].latitude
            ]
          }
        };
      }

     // console.log(this.driverInfo);

  }


}
