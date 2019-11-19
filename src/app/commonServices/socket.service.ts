import { Injectable } from '@angular/core';
import { config } from 'src/config/config';
import * as io from 'socket.io-client';

@Injectable({
  providedIn: 'root'
})
export class SocketService {
  public websocket:any;
  public drivergpssocket:any;
  configSettings = new config();
  socketUrl = this.configSettings.env.socket_api_url;
  driverSocketUrl = this.configSettings.env.driver_socket_api_url;
  companyId = this.configSettings.env.company_id;
  userAccessToken = this.configSettings.env.user_access_token;

  //let url = "wss://gps.app-tree.co.uk:3000";
  //url += `/?token=${json.userId}&companyId=${json.companyId}&userType=${json.userType}`;
  url = this.driverSocketUrl+'/?token='+this.userAccessToken+'&companyId='+this.companyId+'&userType=company';
  
  

  constructor() {
    //console.log(this.url);
    this.websocket = io(this.socketUrl);
    this.drivergpssocket = io(this.url);
   }
}
