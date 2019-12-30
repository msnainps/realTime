import { Injectable } from '@angular/core';
import * as io from 'socket.io-client';
import { config } from 'src/config/config';
import { SocketService } from 'src/app/commonServices/socket.service';
import { Observable, Observer, throwError,EMPTY } from 'rxjs';
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
  socketRestAPI = this.configSettings.env.socket_rest_api_url;

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
        retry(1),
        catchError(this.handleError)
      )
  }

  /**
   * Withdraw Assigned Route
   * @param shipmentRouteId
   */
  sameDayAssignedRoute(assignFormData): Observable<any> {
    const headers = new HttpHeaders().set('Content-Type', 'text/plain; charset=utf-8');

    this.routeData = {
      'endPointUrl': 'samedaydriverassign',
      'company_id': '' + this.companyId,
      'warehouse_id': '' + this.wairehouseId,
      'email': this.email,
      'access_token': this.access_token,
      'shipment_ticket': ''+assignFormData.shipment_ticket,
      'route_name':''+assignFormData.route_name,
      'driver_id':''+assignFormData.driver_id,
      'assign_time':formatDate(new Date(assignFormData.assign_date_time), 'dd-MM-yyyy hh:mm:ss a', 'en-US', '+0530'),
      "timezone_name":Intl.DateTimeFormat().resolvedOptions().timeZone
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

  //Get All Route Details
  getRouteDetails = (routeId,type) => {
    this.socket.websocket.emit('req-route-details-grid', 
      {
       warehouse_id: this.wairehouseId,
       company_id: this.companyId,
       routedId:routeId,
       route_type:type
      }
    );
    return Observable.create(observer => {
      this.socket.websocket.on('get-route-details-grid', data => {
        observer.next(data);
      });
    });
  }

  //Rease shipment
  releaselJob(rlsTktList,shipRouteId):Observable<any> {
    const headers = new HttpHeaders().set('Content-Type', 'text/plain; charset=utf-8');

    this.routeData = {
      'endPointUrl': 'withdrawroute',
      'company_id': '' + this.companyId,
      'warehouse_id': '' + this.wairehouseId,
      'email': this.email,
      'access_token': this.access_token,
      'shipment_route_id': shipRouteId,
      'shipment_ticket':rlsTktList.join('","'),
      "timezone_name":Intl.DateTimeFormat().resolvedOptions().timeZone
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

  /**
   * Carded Job
   * @param cradedTktList 
   * @param shipRouteId 
   * @param cardedFormValue 
   */
  cardedJob(cradedTktList,shipRouteId,cardedFormValue):Observable<any> {
    const headers = new HttpHeaders().set('Content-Type', 'text/plain; charset=utf-8');

    this.routeData = {
      'endPointUrl': 'cardedbycontroller',
      'company_id': '' + this.companyId,
      'warehouse_id': '' + this.wairehouseId,
      'email': this.email,
      'access_token': this.access_token,
      'shipment_route_id': shipRouteId,
      'shipment_ticket':cradedTktList.join('","'),
      'comment':cardedFormValue.driver_comment,
      'next_date_time':formatDate(new Date(cardedFormValue.carded_date_time), 'dd-MM-yyyy hh:mm:ss a', 'en-US', '+0530'),
      'failure_status':cardedFormValue.carded_status,
      'timezone_name':Intl.DateTimeFormat().resolvedOptions().timeZone
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

  /**
   * Deliver Job
   * @param deliverTktList 
   * @param shipRouteId 
   * @param cardedFormValue 
   */
  deliverJob(deliverTktList,shipRouteId,deliverFormValue):Observable<any> {
    const headers = new HttpHeaders().set('Content-Type', 'text/plain; charset=utf-8');

    this.routeData = {
      'endPointUrl': 'deliveredbycontroller',
      'company_id': '' + this.companyId,
      'warehouse_id': '' + this.wairehouseId,
      'email': this.email,
      'access_token': this.access_token,
      'shipment_route_id': shipRouteId,
      'shipment_ticket':deliverTktList.join(","),
      'comment':deliverFormValue.deliver_comment,
      'next_date_time':formatDate(new Date(deliverFormValue.deliver_date_time), 'dd-MM-yyyy hh:mm:ss a', 'en-US', '+0530'),
      'contact_name':deliverFormValue.contact_person,
      'timezone_name':Intl.DateTimeFormat().resolvedOptions().timeZone
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

  getCasgePDFData(shipmentRouteId):Observable<any>{
    const headers = new HttpHeaders().set('Content-Type', 'text/plain; charset=utf-8');

    this.routeData = {
      'endPointUrl': 'getRunsheetData',
      'company_id': '' + this.companyId,
      'warehouse_id': '' + this.wairehouseId,
      'email': this.email,
      'access_token': this.access_token,
      'routeid': shipmentRouteId,
      'timezone_name':Intl.DateTimeFormat().resolvedOptions().timeZone
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

  //get Disputed List  getDispuedList
  getDispuedList(): Observable<any> {
    const headers = new HttpHeaders().set('Content-Type', 'application/json');
    this.routeData = {
      'endPoint': 'getMoveToDisputeAcions',
    }
    return this.http.get(this.socketRestAPI + this.routeData.endPoint, {
      "headers": headers,
      responseType: 'text' as 'json'
    }).pipe(
      map(data => {
        return data;
      })
    );
  }

  //Moved to disputed
  disputedJob(tktList,disputed_id,booking_type):Observable<any>{
    const headers = new HttpHeaders().set('Content-Type', 'application/json');
    this.routeData = {
      'endPointUrl': 'movetodispute',
      'company_id': '' + this.companyId,
      'warehouse_id': '' + this.wairehouseId,
      'email': this.email,
      'access_token': this.access_token,
      'shipment_ticket':tktList.join(','),
      "timezone_name":Intl.DateTimeFormat().resolvedOptions().timeZone,
      "disputeid":disputed_id,
      "shipment_type":booking_type
    }

    return this.http.post(this.iacrgoApiUrl + this.routeData.endPointUrl,JSON.stringify(this.routeData),{
      "headers": headers,
      responseType: 'text' as 'json'
    }).pipe(
      retry(1),
      map(data => {
        return data;
      })
    );
  }

   //get Disputed List  getDispuedList
   getAssignRouteList(): Observable<any> {
    const headers = new HttpHeaders().set('Content-Type', 'application/json');
    this.routeData = {
      'endPoint': 'getAssingedRouteList',
      'company_id':this.companyId
    }
    return this.http.get(this.socketRestAPI + this.routeData.endPoint+'/'+this.routeData.company_id, {
      "headers": headers,
      responseType: 'text' as 'json'
    }).pipe(
      map(data => {
        return data;
      })
    );
  }

  //ReAssign
  movetoReAssign(tktList,shipment_route_id):Observable<any>{
    const headers = new HttpHeaders().set('Content-Type', 'application/json');
    this.routeData = {
      'endPointUrl': 'assignToCurrentRoute',
      'company_id': '' + this.companyId,
      'warehouse_id': '' + this.wairehouseId,
      'email': this.email,
      'access_token': this.access_token,
      //'shipment_ticket':tktList.join(','),
      'shipment_ticket':tktList,
      "timezone_name":Intl.DateTimeFormat().resolvedOptions().timeZone,
      "shipment_route_id":shipment_route_id,
    }

    return this.http.post(this.iacrgoApiUrl + this.routeData.endPointUrl,JSON.stringify(this.routeData),{
      "headers": headers,
      responseType: 'text' as 'json'
    }).pipe(
      retry(1),
      map(data => {
        return data;
      }),
      catchError((error: HttpErrorResponse) => {
        if (error.error instanceof Error) {
          // A client-side or network error occurred. Handle it accordingly.
          console.error('An error occurred:', error.error.message);
          
        } else {
          console.error(`Backend returned code ${error.status}, body was: ${error.error}`);
          return `${error.status}`;
        }
        return EMPTY;
      })
    );
  }

  //get Shipment Traking Details
  getShipmentTrakingInfo(load_identity,is_internal,job_type):Observable<any>{
    const headers = new HttpHeaders().set('Content-Type', 'application/json');

    if(job_type.toLowerCase() == 'same'){
    this.routeData = {
      'endPointUrl': 'sameday',
      'company_id': '' + this.companyId,
      'warehouse_id': '' + this.wairehouseId,
      'email': this.email,
      'access_token': this.access_token,
      'job_type':job_type,
      "timezone_name":Intl.DateTimeFormat().resolvedOptions().timeZone,
      "identity":load_identity,
      "is_internal":is_internal
    }
  }else if(job_type.toLowerCase() == 'next'){
    this.routeData = {
      'endPointUrl': 'nextday',
      'company_id': '' + this.companyId,
      'warehouse_id': '' + this.wairehouseId,
      'email': this.email,
      'access_token': this.access_token,
      'job_type':job_type,
      "timezone_name":Intl.DateTimeFormat().resolvedOptions().timeZone,
      "identity":load_identity,
      "is_internal":is_internal,
      "isCopyShipment":'',
      "isRepriceCase": "Y"
    }
  }

    return this.http.post(this.iacrgoApiUrl + this.routeData.endPointUrl,JSON.stringify(this.routeData),{
      "headers": headers,
      responseType: 'text' as 'json'
    }).pipe(
      retry(1),
      map(data => {
        return data;
      }),
      catchError((error: HttpErrorResponse) => {
        if (error.error instanceof Error) {
          // A client-side or network error occurred. Handle it accordingly.
          console.error('An error occurred:', error.error.message);
        } else {
          console.error(`Backend returned code ${error.status}, body was: ${error.error}`);
          return `${error.status}`;
        }
        return EMPTY;
      })
    );
  }

  getLatLng(routeId){
    this.socket.websocket.emit('req-lat-lng', 
      {
       company_id: this.companyId,
       routedId:routeId
      }
    );

    return Observable.create(observer => {
      this.socket.websocket.on('get-lat-lng', data => {
        observer.next(data);
      });
    });
  }

}
