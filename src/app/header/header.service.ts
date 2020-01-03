import { Injectable } from '@angular/core';
import { HeaderComponent } from './header.component';
import { config } from 'src/config/config';
import { SocketService } from '../commonServices/socket.service';
import { Observable, Observer, throwError } from 'rxjs';
import { HttpClient, HttpHeaders, HttpErrorResponse } from '@angular/common/http';
import { retry, catchError, map } from 'rxjs/operators';
import { formatDate } from '@angular/common';


@Injectable({
  providedIn: 'root'
})


export class HeaderService {

  configSettings = new config();
  companyId = this.configSettings.env.company_id;
  wairehouseId = this.configSettings.env.wairehouse_id;
  socketRestAPI = this.configSettings.env.socket_rest_api_url;
  apiData;
  observer: Observer<any>;

  notiFicationResponce;
  constructor(private socket: SocketService, private http: HttpClient) {
    this.getHeaderDataEmit();
    this.socket.websocket.on('instantnotiFication', (data) => {
      this.notiFicationResponce = data;
      if (this.notiFicationResponce.company_id == this.companyId) { //if responce is same as session user
        this.getHeaderDataEmit();
      }

    })

  }

  getHeaderDataEmit() {
    this.socket.websocket.emit("getUser", this.companyId, this.wairehouseId);
  }
  getHeaderDataListen(hearderComponent: HeaderComponent) {
    this.socket.websocket.on('user-info', (data) => {

      hearderComponent.header = {
        name: data.user_data.name,
        email: data.user_data.email,
        profileImage: data.user_data.profile_image,
        parcel: data.parcel,
        sameday: data.sameday,
        disputed: data.disputed,
        totalShipement: data.totalShipement
      };
      //this.showLoader=false;
      //return data;
    });
  }

  getSearchResult(getSearchParam): Observable<any> {
    const headers = new HttpHeaders().set('Content-Type', 'application/json');

    var dateFormat:any = formatDate(new Date(getSearchParam.searchdate), 'dd-MM-yyyy', 'en-US', '+0530');
    var search_param: any = { "date": dateFormat, "value": getSearchParam.searchvalue };
    
    this.apiData = {
      'endPoint': 'getSearchRecord',
      'company_id': '' + this.companyId,
      'search_param': search_param
    }

    return this.http.post<any>(this.socketRestAPI + this.apiData.endPoint, JSON.stringify(this.apiData),
      {
        "headers": headers,
        responseType: 'text' as 'json'
      })
      .pipe(
        retry(1),
        catchError(this.handleError)
      )
  }

  handleError(error: HttpErrorResponse) {
    if (error.error instanceof ErrorEvent) {
      console.error('An error occurred:', error.error.message);
    } else {
      console.error(
        `Backend returned code ${error.status}, ` +
        `body was: ${error.error}`);
      console.log(error.error);
    }
    return throwError(
      'Something bad happened; please try again later.');
  };

  
  saveSearchDate(dateInfo): Observable<any> {
    this.socket.websocket.emit('save-header-date', { 
      warehouse_id: this.wairehouseId,
      company_id: this.companyId,
      start_date: dateInfo.start_date,
      end_date:  dateInfo.end_date
    });
    this.socket.websocket.on('get-header-date', (data) => {
      this.observer.next(data);
    })
    return this.createObservable();
  }

  createObservable(): Observable<any> {
    return new Observable(observer => {
      this.observer = observer;
    });
  }

  deleteSearchDate():Observable<any> {
    this.socket.websocket.emit('delete-header-date', { 
      warehouse_id: this.wairehouseId,
      company_id: this.companyId
    });
    this.socket.websocket.on('get-header-date', (data) => {
      this.observer.next(data);
    })
    return this.createObservable();
  }

  getHeaderSavedDate():Observable<any> {
    this.socket.websocket.emit('req-header-date', {
      warehouse_id: this.wairehouseId,
      company_id: this.companyId
    });
    this.socket.websocket.on('get-header-date', (data) => {
      console.log(data);
      this.observer.next(data);
    })
    return this.createObservable();
  }
}
