import { Injectable } from '@angular/core';
import { config } from 'src/config/config';
import * as io from 'socket.io-client';

@Injectable({
  providedIn: 'root'
})
export class SocketService {
  public websocket:any;
  configSettings = new config();
  socketUrl = this.configSettings.env.socket_api_url;

  constructor() {
    this.websocket = io(this.socketUrl);
   }
}
