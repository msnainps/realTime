import { Injectable } from '@angular/core';
import { config } from 'src/config/config';
import { SocketService } from '../commonServices/socket.service';
import { MapboxService } from '../mapbox/mapbox.service';

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


  points: any = {
    "type": "FeatureCollection",
    "features": []
  };
  driverGpsInfo = {}
  driverInfo: any = {
    "type": "FeatureCollection",
    "features": []
  };
  public formatedData: any = {
    'type': 'geojson',
    "data": {
      "type": "FeatureCollection",
      "features": []
    }
  };
  constructor(private socket: SocketService, private mapbox: MapboxService) {

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
      data.shipment_data.push.apply(data.shipment_data, data.unassgn_shipment_data);
      data.shipment_data.push.apply(data.shipment_data, data.completed_shipment_data)

      console.log(data.shipment_data);

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
            'execution_order': data.shipment_data[index1].icargo_execution_order,
            'message': 'bangulare'
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

      this.formatedData.data.features = this.points.features;
      //console.log(JSON.stringify(this.formatedData));
      if (this.mapbox.map.getSource('points') != undefined) {
        this.mapbox.map.getSource('points').setData(this.formatedData.data);
      }
    });

  }

  loadDropOnMapsEmit() {
    this.socket.websocket.emit('req-all-drops', { search_date: '', warehouse_id: this.wairehouseId, company_id: this.companyId });
  }

  loadDriverData() {
    this.socket.drivergpssocket.on('offline-data-process', driverData => {
      var driverDataGps = (JSON.parse(driverData));
      if (driverDataGps.source == 'gps-location') {
        //if(driverData.payload.companyId == this.companyId){
        //if(driverDataGps.payload.companyId == 194){ 
        this.plotDriverOnMap(driverDataGps);
        //}
      }

    })
  }

  plotDriverOnMap(driverData) {
    let checkDriver = false;
    for (var index2 in this.driverInfo.features) {
      if (this.driverInfo.features[index2]['uid'] == driverData.payload.userId) {
        checkDriver = true;
        this.driverInfo.features[index2] = {
          'type': 'Feature',
          "uid": driverData.payload.userId,
          'properties': {
            'description':
              driverData.payload.userId,
            'icon': 'motorbike',
            'execution_order': driverData.payload.userId,
          },
          'geometry': {
            'type': 'Point',
            'coordinates': [
              driverData.payload.longitude,
              driverData.payload.latitude
            ]
          }
        };
      }
    }
    if (checkDriver == false) {
      var newDriverfeatures = {
        'type': 'Feature',
        "uid": driverData.payload.userId,
        'properties': {
          'description':
            driverData.payload.userId,
          'icon': 'motorbike',
          'execution_order': driverData.payload.userId,
        },
        'geometry': {
          'type': 'Point',
          'coordinates': [
            driverData.payload.longitude,
            driverData.payload.latitude
          ]
        }
      };

      this.driverInfo.features.push(newDriverfeatures);
    }
    this.formatedData.data.features = this.driverInfo.features;
    //console.log(JSON.stringify(this.formatedData));
    if (this.mapbox.map.getSource('drivers') != undefined) {
      this.mapbox.map.getSource('drivers').setData(this.formatedData.data);
    }
  }


}
