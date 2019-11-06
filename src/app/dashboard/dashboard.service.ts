import { Injectable } from '@angular/core';
import { config } from 'src/config/config';
import { SocketService } from '../commonServices/socket.service';

@Injectable({
  providedIn: 'root'
})
export class DashboardService {

  configSettings = new config();
  companyId = this.configSettings.env.company_id;
  wairehouseId = this.configSettings.env.wairehouse_id;
  public markerList:any=new Array();

  //socket;
  notiFicationResponce;


  
  constructor(private socket:SocketService) { 
    this.loadDropOnMapsEmit();
    
  }

  loadDropOnMapsListen(){
    this.socket.websocket.on('get-all-drops',(data)=>{
        console.log(data);
        this.markerList=data.shipment_data;
    });
  }

  loadDropOnMapsEmit(){
    this.socket.websocket.emit('req-all-drops', { search_date: '', warehouse_id:this.wairehouseId,company_id:this.companyId});
  }
}
