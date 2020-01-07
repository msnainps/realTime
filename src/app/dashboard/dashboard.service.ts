import { Injectable } from '@angular/core';
import { config } from 'src/config/config';
import { SocketService } from '../commonServices/socket.service';
import { MapboxService } from '../mapbox/mapbox.service';
import { Observable, Observer, throwError } from 'rxjs';
import { HttpClient, HttpHeaders, HttpErrorResponse } from '@angular/common/http';
import { retry, catchError, map } from 'rxjs/operators';
import { formatDate } from '@angular/common';




@Injectable({
  providedIn: 'root'
})
export class DashboardService {

  configSettings = new config();
  companyId = this.configSettings.env.company_id;
  wairehouseId = this.configSettings.env.wairehouse_id;
  iacrgoApiUrl = this.configSettings.env.icargo_api_url;
  email = this.configSettings.env.email;
  access_token = this.configSettings.env.icargo_access_token;
  public markerList: any = new Array();
  routeData: any;
  mapData: any;
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
  constructor(private socket: SocketService, private mapbox: MapboxService, private http: HttpClient) {

    this.loadDropOnMapsEmit();
    this.loadDriverData();


    this.socket.websocket.on('instantnotiFication', (data) => {
      console.log('---Notification---');
      console.log(data);
      console.log('---Notification---');
      this.notiFicationResponce = data;
      if (this.notiFicationResponce.company_id == this.companyId) { //if responce is same as session user
        setTimeout(() => {
          this.loadDropOnMapsEmit();
        }, 2000);
      }

    })
  }

  loadDropOnMapsListen() {
    this.socket.websocket.on('get-all-drops', (data) => {
      //this.markerList = data.shipment_data;
      //data.shipment_data.push.apply(data.shipment_data, data.unassgn_shipment_data);
      //data.shipment_data.push.apply(data.shipment_data, data.completed_shipment_data)
      console.log(data);
      this.points.features = [];
      this.mapData = data;
      for (var index1 in data.mapPlotData) {
        this.points.features[index1] = {
          'type': 'Feature',
          'properties': {
            'description':
              (data.mapPlotData[index1].drop_type == 'same-coord' ? data.mapPlotData[index1].shipmentTicketList :
                '<div class="drops-headding">' + data.mapPlotData[index1].route_name + '</div>\
              <div class="drops-min"><i class="material-icons drops-min-color1">home</i> <span>'+ data.mapPlotData[index1].customer_name + '</span><div>' + data.mapPlotData[index1].fulladdress + '</div></div>\
              <div class="drops-min"><i class="material-icons drops-min-color2">help_outline</i> <span>Ref:'+ data.mapPlotData[index1].cr + '</span><div>  <span>Job:</span> ' + data.mapPlotData[index1].job_type + '</div><div>  <span>Ticket:</span> ' + data.mapPlotData[index1].shipment_ticket + '</div></div>\
              <div class="drops-min"><i class="material-icons drops-min-color2">visibility</i> <span><a href="" onClick ="document.mapCom.viewDetailsFromMap(\'' + index1 + '\',\'' + data.mapPlotData[index1].drop_type + '\')" data-toggle="modal" data-target="#Modal4">View Details</a></span></div>\
              <div class="drops-line"></div>\
              <div class="drops-min"><i class="material-icons drops-min-color3">local_car_wash</i> <span>'+ data.mapPlotData[index1].driver_name + '</span><div>\
              <div class="postion-set">\
              '+ (data.mapPlotData[index1].drop_type == 'unassinged' ? data.driverList : "") + '\
              </div></div>'),
            'icon': data.mapPlotData[index1].marker_url,
            'execution_order': data.mapPlotData[index1].icargo_execution_order,
            'shipment_id': data.mapPlotData[index1].shipment_ticket,
            'shipment_route_id': data.mapPlotData[index1].shipment_routed_id,
            'loadIdentity': data.mapPlotData[index1].instaDispatch_loadIdentity
          },
          'geometry': {
            'type': 'Point',
            'coordinates': [
              data.mapPlotData[index1].shipment_longitude,
              data.mapPlotData[index1].shipment_latitude
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

    //Get Driver Info from fire base before gps location
    this.getDriverInfoFromUserNode();

    this.socket.drivergpssocket.on('offline-data-process', driverData => {
      var driverDataGps = (JSON.parse(driverData));
      if (driverDataGps.source == 'gps-location') {
        console.log("-----Driver GPS Data---");
        console.log(driverDataGps);
        console.log("!-----Driver GPS Data---");
        if (driverDataGps.payload.companyId == this.companyId) {
          //if(driverDataGps.payload.companyId == 194){ 
          this.plotDriverOnMap(driverDataGps);
        }
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
            'name': this.getDriverNameInitials(driverData.payload.profileName),
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
          'name': this.getDriverNameInitials(driverData.payload.profileName),
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
    //console.log(this.driverInfo.features);
    this.formatedDataDriver.data.features = this.driverInfo.features;
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

  vechileType(vechileType: any) {
    if (vechileType) {
      if (vechileType.toLowerCase() == 'van' || vechileType.toLowerCase() == 'car') {
        return 'mini-van'
      } else if (vechileType.toLowerCase() == 'bike' || vechileType.toLowerCase() == 'motorbike' || vechileType.toLowerCase() == 'pushbike') {
        return 'motorbike';
      } else if (vechileType.toLowerCase() == 'cycle' || vechileType.toLowerCase() == 'bycycle' || vechileType.toLowerCase() == 'cargobike') {
        return 'cycle'
      } else {
        return 'mini-van'
      }
    } else {
      return 'mini-van'
    }
  }

  assignDriverToRoute(routeData: any = Object): Observable<any> {
    const headers = new HttpHeaders().set('Content-Type', 'text/plain; charset=utf-8');
    return this.http.post<any>(this.iacrgoApiUrl + routeData.endPointUrl, JSON.stringify(routeData),
      {
        headers, responseType: 'text' as 'json'
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

  /**
   * Get Shipment TicketInfo and Driver Details
   * @param shipmentTkt 
   */
  getSameCorrdinateTktInfo(shipmentTkt: string): Observable<any> {
    this.socket.websocket.emit('req-shipmentTkt-info', { warehouse_id: this.wairehouseId, company_id: this.companyId, shipment_tkt: shipmentTkt });
    this.socket.websocket.on('get-shipmentTkt-info', (data) => {
      this.observer.next(data);
    })
    return this.createObservable();
  }

  //get Tkt and Route name
  getDropInfo(loadIdentity): Observable<any> {
    this.socket.websocket.emit('req-drop-info', { warehouse_id: this.wairehouseId, company_id: this.companyId, loadIdentity: loadIdentity });
    this.socket.websocket.on('get-drop-info', (data) => {
      this.observer.next(data);
    })
    return this.createObservable();
  }

  /**
   * Same Day driver assign
   * @param data
   */
  sameDayAssignedRoute(data, driver_id): Observable<any> {
    const headers = new HttpHeaders().set('Content-Type', 'text/plain; charset=utf-8');

    this.routeData = {
      'endPointUrl': 'samedaydriverassign',
      'company_id': '' + this.companyId,
      'warehouse_id': '' + this.wairehouseId,
      'email': this.email,
      'access_token': this.access_token,
      'shipment_ticket': '' + data.shipmentKey,
      'route_name': '' + data.routeName,
      'driver_id': '' + driver_id,
      'assign_time': formatDate(new Date(), 'dd-MM-yyyy hh:mm:ss a', 'en-US', '+0530'),
      "timezone_name": Intl.DateTimeFormat().resolvedOptions().timeZone
    }


    return this.http.post<any>(this.iacrgoApiUrl + this.routeData.endPointUrl, JSON.stringify(this.routeData),
      {
        headers, responseType: 'text' as 'json'
      })
      .pipe(
        retry(1),
        catchError(this.handleError)
      )
  }

  //Show driver secod name initials
  getDriverNameInitials(drivareName) {
    if (drivareName) {
      var dname = drivareName;
      dname = dname.split(" ");
      var fullname = '';
      if (dname.length > 1) {
        fullname = dname[0] + ' ' + dname[1].charAt(0);
        return fullname;
      } else {
        fullname = dname[0];
        return fullname;
      }
    } else {
      return '';
    }

  }


  /**
   * Get Driver Details from Firebase User node
   */
  getDriverInfoFromUserNode() {
    let driverUserNodeStatus = false;
    if (driverUserNodeStatus == false) {
      this.socket.drivergpssocket.on('driver-info', ds => {
        driverUserNodeStatus = true;
        console.log("-----Driver User Node Data----");
        console.log(ds);
        console.log("-----Driver User Node Data----");
        if (ds.length) {
          for (var dInfo in ds) {
            var newDriverfeatures = {
              'type': 'Feature',
              "uid": ds[dInfo]['userId'],
              'properties': {
                'description':
                  ds[dInfo]['userId'],
                'icon':this.vechileType(''),
                'execution_order': '',
                'driver_id': ds[dInfo]['userId'],
                'battery_status': '',
                'name': this.getDriverNameInitials(ds[dInfo]['profileName']),
                'last_sync_time': ds[dInfo]['time']
              },
              'geometry': {
                'type': 'Point',
                'coordinates': [
                  ds[dInfo]['longitude'],
                  ds[dInfo]['latitude']
                ]
              }
            };

            this.driverInfo.features.push(newDriverfeatures);
            this.formatedDataDriver.data.features = this.driverInfo.features;
            if (this.mapbox.map.getSource('drivers') != undefined) {
              this.mapbox.map.getSource('drivers').setData(this.formatedDataDriver.data);
            }
          }
        }

      })
    }

  }


  // vechileTypeName(driverId,companyId){
  //   console.log(driverId);
  // }



}
