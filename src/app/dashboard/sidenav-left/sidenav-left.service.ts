import { Injectable } from '@angular/core';
import * as io from 'socket.io-client';
import { config } from 'src/config/config';
import { SocketService } from 'src/app/commonServices/socket.service';

@Injectable({
  providedIn: 'root'
})
export class SidenavLeftService {

  configSettings = new config();
  companyId = this.configSettings.env.company_id;
  wairehouseId = this.configSettings.env.wairehouse_id;
  public assignDataList:any=new Array();

  constructor(private socket:SocketService) {}
  
  getAssignDropData(){
    this.socket.websocket.on('get-all-drops',(data)=>{
      console.log(data);
      this.assignDataList = data;
   });
  }
}
