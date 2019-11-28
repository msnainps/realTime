import { Injectable } from '@angular/core';
import { config } from 'src/config/config';
import { SocketService } from '../commonServices/socket.service';
import { MapboxService } from '../mapbox/mapbox.service';
import { Observable, Observer,throwError } from 'rxjs';
import { HttpClient, HttpHeaders, HttpErrorResponse } from '@angular/common/http';
import { retry, catchError, map } from 'rxjs/operators';





@Injectable({
  providedIn: 'root'
})
export class DashboardService {

  configSettings = new config();
  companyId = this.configSettings.env.company_id;
  wairehouseId = this.configSettings.env.wairehouse_id;
  iacrgoApiUrl = this.configSettings.env.icargo_api_url;
  public markerList: any = new Array();

  //socket;
  notiFicationResponce;
  observer: Observer<any>;

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

  public formatedDataDriver: any = {
    'type': 'geojson',
    "data": {
      "type": "FeatureCollection",
      "features": []
    }
  };
  constructor(private socket: SocketService, private mapbox: MapboxService, private http:HttpClient) {

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

      console.log(data);

      for (var index1 in data.shipment_data) {
        this.points.features[index1] = {
          'type': 'Feature',
          'properties': {
            'description':
              '<div class="drops-headding">' + data.shipment_data[index1].shipment_ticket + '</div>\
              <div class="drops-min"><i class="material-icons drops-min-color1">home</i> <span>'+ data.shipment_data[index1].customer_name + '</span><div>' + data.shipment_data[index1].fulladdress + '</div></div>\
              <div class="drops-min"><i class="material-icons drops-min-color2">help_outline</i> <span>Ref:'+ data.shipment_data[index1].cr + '</span><div>  <span>Job:</span> ' + data.shipment_data[index1].job_type + '</div></div>\
              <div class="drops-line"></div>\
              <div class="drops-min"><i class="material-icons drops-min-color3">local_car_wash</i> <span>'+ data.shipment_data[index1].driver_name + '</span><div>\
              <div class="postion-set"><div class="dropdown show">\
              <a class="dropdown-toggle" href="#" role="button" id="dropdownMenuLink" data-toggle="dropdown" aria-haspopup="true" aria-expanded="false">\
              <i class="material-icons"> person_add </i></a>\
              '+data.driverList+'</div>\
              </div></div>',
            'icon': data.shipment_data[index1].marker_url,
            'execution_order': data.shipment_data[index1].icargo_execution_order,
            'shipment_id':data.shipment_data[index1].shipment_ticket,
            'shipment_route_id':data.shipment_data[index1].shipment_routed_id
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
        console.log("-----Driver GPS Data---");
        console.log(driverDataGps);
        console.log("!-----Driver GPS Data---");
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
            'icon': this.vechileType(driverData.payload.vechileType),
            'execution_order': driverData.payload.userId,
            'driver_id': driverData.payload.userId,
            'battery_status': driverData.payload.batteryStatus,
            'name': driverData.payload.profileName,
            'last_sync_time': driverData.payload.time
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
          'icon': this.vechileType(driverData.payload.vechileType),
          'execution_order': driverData.payload.userId,
          'driver_id': driverData.payload.userId,
          'battery_status': driverData.payload.batteryStatus,
          'name': driverData.payload.profileName,
          'last_sync_time': driverData.payload.time
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
    this.formatedDataDriver.data.features = this.driverInfo.features;
    //console.log(JSON.stringify(this.formatedData));
    if (this.mapbox.map.getSource('drivers') != undefined) {
      this.mapbox.map.getSource('drivers').setData(this.formatedDataDriver.data);
    }
  }

  getDriverParcelInfo(driver_id: Number): Observable<any> {
    this.socket.websocket.emit('req-driver-shipment-info', { warehouse_id: this.wairehouseId, company_id: this.companyId, driver_id: driver_id });
    this.socket.websocket.on('get-driver-shipment-info', (data) => {
      this.observer.next(data);
    })
    return this.createObservable();
  }

  createObservable(): Observable<any> {
    return new Observable(observer => {
      this.observer = observer;
    });
  }

  vechileType(vechileType:any){
    if(vechileType){
      if(vechileType.toLowerCase() == 'van' || vechileType.toLowerCase() == 'car'){
        return 'mini-van'
      }else if(vechileType.toLowerCase() == 'bike'){
        return 'motorbike';
      }else if(vechileType.toLowerCase() == 'cycle'){
        return 'cycle'
      }else{
        return 'mini-van'
      }
    }else{
      return 'mini-van'
    }
  }

  assignDriverToRoute(routeData:any=Object):Observable<any>{
    const headers = new HttpHeaders().set('Content-Type', 'text/plain; charset=utf-8');
    return this.http.post<any>(this.iacrgoApiUrl+routeData.endPointUrl, JSON.stringify(routeData), 
    {
      headers, responseType:'text' as 'json'
    })
    .pipe(
      retry(),
      catchError(this.handleError)
    )
  }

   // Error handling 
   // Handle API errors
  handleError(error: HttpErrorResponse) {
    if (error.error instanceof ErrorEvent) {
      // A client-side or network error occurred. Handle it accordingly.
      console.error('An error occurred:', error.error.message);
    } else {
      // The backend returned an unsuccessful response code.
      // The response body may contain clues as to what went wrong,
      console.error(
        `Backend returned code ${error.status}, ` +
        `body was: ${error.error}`);
        console.log(error.error);
    }
    // return an observable with a user-facing error message
    return throwError(
      'Something bad happened; please try again later.');
  };

}
