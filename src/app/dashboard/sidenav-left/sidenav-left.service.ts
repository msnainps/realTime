import { Injectable } from '@angular/core';
import * as io from 'socket.io-client';
import { config } from 'src/config/config';
import { SocketService } from 'src/app/commonServices/socket.service';
import { Observable, Observer, throwError } from 'rxjs';
import { HttpClient, HttpHeaders, HttpErrorResponse } from '@angular/common/http';
import { retry, catchError, map } from 'rxjs/operators';
import { formatDate } from '@angular/common';


@Injectable({
  providedIn: 'root'
})
export class SidenavLeftService {

  configSettings = new config();
  companyId = this.configSettings.env.company_id;
  wairehouseId = this.configSettings.env.wairehouse_id;
  iacrgoApiUrl = this.configSettings.env.icargo_api_url;
  email = this.configSettings.env.email;
  access_token = this.configSettings.env.icargo_access_token;
  

  public dataList: any = new Array();

  constructor(private socket: SocketService, private http: HttpClient) { }
  routeData;
  getAssignDropData() {
    this.socket.websocket.on('get-all-drops', (data) => {
      //console.log(data);
      this.dataList = data;
    });
  }

  /**
   * Check Shipemnt ticket is eligile for cancel or not
   * @param shipmentTkt 
   */
  checkEligibleForCancel(shipmentTkt): Observable<any> {
    const headers = new HttpHeaders().set('Content-Type', 'text/plain; charset=utf-8');

    this.routeData = {
      'endPointUrl': 'checkEligibleForCancelNew',
      'company_id': '' + this.companyId,
      'warehouse_id': '' + this.wairehouseId,
      'email': this.email,
      'access_token': this.access_token,
      'job_identity': [shipmentTkt]
    }

    return this.http.post<any>(this.iacrgoApiUrl + this.routeData.endPointUrl, JSON.stringify(this.routeData),
      {
        headers, responseType: 'text' as 'json'
      })
      .pipe(
        retry(),
        catchError(this.handleError)
      )
  }

  /**
   * cancel Job if eligible
   * @param shipmentTkt 
   */
  cancelJob(shipmentTkt): Observable<any> {
    const headers = new HttpHeaders().set('Content-Type', 'text/plain; charset=utf-8');

    this.routeData = {
      'endPointUrl': 'cancelJob',
      'company_id': '' + this.companyId,
      'warehouse_id': '' + this.wairehouseId,
      'email': this.email,
      'access_token': this.access_token,
      'job_identity': [shipmentTkt],
      'user':'' + this.companyId,
      "timezone_name":Intl.DateTimeFormat().resolvedOptions().timeZone
    }

    return this.http.post<any>(this.iacrgoApiUrl + this.routeData.endPointUrl, JSON.stringify(this.routeData),
      {
        headers, responseType: 'text' as 'json'
      })
      .pipe(
        retry(),
        catchError(this.handleError)
      )
  }

  /**
   * Withdraw Assigned Route
   * @param shipmentRouteId
   */
  withdrawAssignedRoute(shipmentRouteId): Observable<any> {
    const headers = new HttpHeaders().set('Content-Type', 'text/plain; charset=utf-8');

    this.routeData = {
      'endPointUrl': 'withdrawAssignedRoute',
      'company_id': '' + this.companyId,
      'warehouse_id': '' + this.wairehouseId,
      'email': this.email,
      'access_token': this.access_token,
      'shipment_route_id': ''+shipmentRouteId,
      "timezone_name":Intl.DateTimeFormat().resolvedOptions().timeZone
    }

    return this.http.post<any>(this.iacrgoApiUrl + this.routeData.endPointUrl, JSON.stringify(this.routeData),
      {
        headers, responseType: 'text' as 'json'
      })
      .pipe(
        retry(),
        catchError(this.handleError)
      )
  }

  /**
   * Withdraw Assigned Route
   * @param shipmentRouteId
   */
  sameDayAssignedRoute(assignFormData): Observable<any> {
    const headers = new HttpHeaders().set('Content-Type', 'text/plain; charset=utf-8');

    console.log(assignFormData);
    

    this.routeData = {
      'endPointUrl': 'samedaydriverassign',
      'company_id': '' + this.companyId,
      'warehouse_id': '' + this.wairehouseId,
      'email': this.email,
      'access_token': this.access_token,
      'shipment_ticket': ''+assignFormData.shipment_ticket,
      'route_name':''+assignFormData.route_name,
      'driver_id':''+assignFormData.driver_id,
      'assign_time':formatDate(new Date(), 'dd-MM-yyyy hh:mm:ss a', 'en-US', '+0530'),
      "timezone_name":Intl.DateTimeFormat().resolvedOptions().timeZone
    }

    console.log(this.routeData);

    return this.http.post<any>(this.iacrgoApiUrl + this.routeData.endPointUrl, JSON.stringify(this.routeData),
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

  //Get Driver List
  getDriverList(){
    this.socket.websocket.emit('req-driver-list', { warehouse_id: this.wairehouseId, company_id: this.companyId});
    return Observable.create(observer => {
      this.socket.websocket.on('get-driver-list', data => {
        observer.next(data);
      });
    });
  }

  //Get All Tickets
  getAllTickets(tkt,routeId){
    this.socket.websocket.emit('req-ticket-list', 
      {
       warehouse_id: this.wairehouseId,
       company_id: this.companyId,
       loadIdentity:tkt,
       routedId:routeId
      }
    );
    return Observable.create(observer => {
      this.socket.websocket.on('get-ticket-list', data => {
        observer.next(data);
      });
    });
  }


}
