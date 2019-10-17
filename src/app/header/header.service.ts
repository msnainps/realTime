import { Injectable } from '@angular/core';
import * as io from 'socket.io-client';
import { HeaderComponent } from './header.component';
import { config } from 'src/config/config';



@Injectable({
  providedIn: 'root'
})


export class HeaderService {

  configSettings = new config();
  apiUrl = this.configSettings.env.socket_api_url;
  companyId = this.configSettings.env.company_id;
  wairehouseId = this.configSettings.env.wairehouse_id;
  
  
  socket;
  constructor() { 
    this.socket = io(this.apiUrl);
    this.getHeaderDataEmit();
  }

  getHeaderDataEmit(){
    this.socket.emit("getUser",this.companyId,this.wairehouseId);
  }
  getHeaderDataListen(hearderComponent:HeaderComponent){
    this.socket.on('user-info',(data)=>{
      
      hearderComponent.header  = {
        name:data.user_data.name,
        email:data.user_data.email,
        profileImage:data.user_data.profile_image,
        parcel:data.parcel,
        sameday:data.sameday,
        disputed:data.disputed,
        totalShipement:data.totalShipement
      };
      //this.showLoader=false;
      //return data;
      
    });
  }
}
