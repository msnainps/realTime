import { Injectable } from '@angular/core';
import { HeaderComponent } from './header.component';
import { config } from 'src/config/config';
import { SocketService } from '../commonServices/socket.service';




@Injectable({
  providedIn: 'root'
})


export class HeaderService {

  configSettings = new config();
  companyId = this.configSettings.env.company_id;
  wairehouseId = this.configSettings.env.wairehouse_id;
  
  
  
  notiFicationResponce;
  constructor(private socket:SocketService) {
    this.getHeaderDataEmit();
    this.socket.websocket.on('instantnotiFication',(data)=>{
      this.notiFicationResponce = data;
      if(this.notiFicationResponce.company_id == this.companyId){ //if responce is same as session user
        this.getHeaderDataEmit();
      }
     
    })
    
  }

  getHeaderDataEmit(){
    this.socket.websocket.emit("getUser",this.companyId,this.wairehouseId);
  }
  getHeaderDataListen(hearderComponent:HeaderComponent){
    this.socket.websocket.on('user-info',(data)=>{
      
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
