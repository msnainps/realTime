import { Injectable } from '@angular/core';
import { Observable, Observer, throwError } from 'rxjs';
import { HttpClient, HttpHeaders, HttpErrorResponse } from '@angular/common/http';
import { config } from 'src/config/config';
import { retry, catchError, map } from 'rxjs/operators';

@Injectable({
  providedIn: 'root'
})
export class FilterService {

  configSettings = new config();
  companyId = this.configSettings.env.company_id;
  wairehouseId = this.configSettings.env.wairehouse_id;
  socketRestAPI = this.configSettings.env.socket_rest_api_url;
  apiData;

  constructor(private http: HttpClient) { }

  saveFilter(filterData):Observable<any>{
    const headers = new HttpHeaders().set('Content-Type', 'application/json');

    this.apiData = {
      'endPoint': 'savefilterData',
      'company_id': '' + this.companyId,
      'warehouse_id': '' + this.wairehouseId,
      'data':filterData
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
}
