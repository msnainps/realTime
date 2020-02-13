import { Injectable } from '@angular/core';
import { Observable, Observer, throwError } from 'rxjs';
import { HttpClient, HttpHeaders, HttpErrorResponse } from '@angular/common/http';
import { config } from 'src/config/config';
import { retry, catchError, map } from 'rxjs/operators';
import { SocketService } from 'src/app/commonServices/socket.service';
import { SharedService } from 'src/app/shared/shared.service';



@Injectable({
  providedIn: 'root'
})
export class FilterService {

  configSettings = new config();
  companyId = this.configSettings.env.company_id;
  wairehouseId = this.configSettings.env.wairehouse_id;
  socketRestAPI = this.configSettings.env.socket_rest_api_url;
  apiData;
  observer: Observer<any>;
  hubData:any;
  

  constructor(private http: HttpClient,private socket: SocketService ,private sharedService:SharedService) {
  }

  saveFilter(filterData,hubFilterData):Observable<any>{
    const headers = new HttpHeaders().set('Content-Type', 'application/json');

    this.apiData = {
      'endPoint': 'savefilterData',
      'company_id': '' + this.companyId,
      'warehouse_id': '' + this.wairehouseId,
      'data':filterData,
      'hubdata':hubFilterData
    }

    return this.http.post<any>(this.socketRestAPI + this.apiData.endPoint, JSON.stringify(this.apiData),
      {
        "headers":headers, 
        responseType: 'text' as 'json'
      })
      .pipe(
        retry(1),
        catchError(this.handleError)
      )
  }

  getFilterRecord():Observable<any>{
    const headers = new HttpHeaders().set('Content-Type', 'application/json');

    this.apiData = {
      'endPoint': 'getFilterData',
      'company_id': '' + this.companyId,
      'warehouse_id': '' + this.wairehouseId,
    }
    
    return this.http.post<any>(this.socketRestAPI + this.apiData.endPoint, JSON.stringify(this.apiData),
      {
        "headers":headers, 
        responseType: 'text' as 'json'
      })
      .pipe(
        retry(1),
        catchError(this.handleError)
      )
  }

  deleteFilter():Observable<any>{
    const headers = new HttpHeaders().set('Content-Type', 'application/json');

    this.apiData = {
      'endPoint': 'deleteFilter',
      'company_id': '' + this.companyId,
      'warehouse_id': '' + this.wairehouseId,
    }

    return this.http.delete<any>(this.socketRestAPI + this.apiData.endPoint+'/'+this.apiData.company_id+'/'+this.apiData.warehouse_id,
      {
        "headers":headers, 
        responseType: 'text' as 'json'
      })
      .pipe(
        retry(1),
        catchError(this.handleError)
      )
  }

  getHubDetails():Observable<any>{
    this.socket.websocket.emit('req-hub-info', { 
      warehouse_id: this.wairehouseId,
      company_id: this.companyId,
    });
    // this.socket.websocket.on('get-header-date', (data) => {
    //   this.observer.next(data);
    // })
    return this.createObservable();
  }

  createObservable(): Observable<any> {
    return new Observable(observer => {
      this.observer = observer;
    });
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

  setHubListner(){
    this.socket.websocket.on('get-hub-info', (data) => {
      this.hubData = data;
      if(this.sharedService.filterDialogCmpShared!=null){
        this.sharedService.filterDialogCmpShared.listenWhenGetHubList();
      }
    })
  }

}
