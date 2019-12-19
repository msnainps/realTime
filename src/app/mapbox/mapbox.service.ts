import { Injectable } from '@angular/core';
import { config } from 'src/config/config';
import { getInterpolationArgsLength } from '@angular/compiler/src/render3/view/util';
declare var mapboxgl: any;
import { Observable, Observer, throwError } from 'rxjs';
import { HttpClient, HttpHeaders, HttpErrorResponse } from '@angular/common/http';
import { retry, catchError, map } from 'rxjs/operators';


@Injectable({
  providedIn: 'root'
})
export class MapboxService {
  public map: any;
  spiderfier: any;
  lng: any;
  lat: any;
  info;
  apiData;


  configSettings = new config();
  wairehouseId = this.configSettings.env.wairehouse_id;
  socketRestAPI = this.configSettings.env.socket_rest_api_url;

  constructor(private http: HttpClient) {
    mapboxgl.accessToken = (new config()).env.mapbox_api_key;
  }
  public async initMap() {
    const promise: any = new Promise((resolve, reject) => {
      this.getLatLng().subscribe(latlngInfo => {
        this.info = JSON.parse(latlngInfo);
        this.lng = this.info.message[0].longitude;
        this.lat = this.info.message[0].latitude;
        this.map = new mapboxgl.Map({
          container: 'map',
          style: 'mapbox://styles/instadispatch/ck3ps5h4n1e9r1co0e7wctvhz',
          zoom: 10,
          center: [this.lng, this.lat],
        });
        this.map.addControl(new mapboxgl.NavigationControl());
        resolve({});
      }, err => { reject(err) });
    });
    //get Wairehouse lat long
    return promise;
  }

  getLatLng(): Observable<any> {
    const headers = new HttpHeaders().set('Content-Type', 'application/json');
    this.apiData = {
      'endPoint': 'getWaireHouseLatLong',
      'warehouse_id': '' + this.wairehouseId,
    }
    return this.http.get(this.socketRestAPI + this.apiData.endPoint + '/' + this.apiData.warehouse_id, {
      "headers": headers,
      responseType: 'text' as 'json'
    }).pipe(
      map(data => {
        return data;
      })
    );
  }

}