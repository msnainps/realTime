import { Component, OnInit, AfterViewInit, Output } from '@angular/core';
import { DashboardService } from './dashboard.service';
import { MapMouseEvent } from 'mapbox-gl';
import { MapboxService } from '../mapbox/mapbox.service';
declare var mapboxgl:any;

@Component({
  selector: 'app-dashboard',
  templateUrl: './dashboard.component.html',
  styleUrls: ['./dashboard.component.css']
})
export class DashboardComponent implements OnInit {

  //Google Map Loading Defualt Lat long (UK)
  lat = 51.75343480000000000000;
  lng = -1.27945500000000000000;
  mapBoxStyle = "mapbox://styles/instadispatch/ck2u7n91p3kvq1cp30yrc0uz5";
  zoom = 8;

  //points: GeoJSON.FeatureCollection<GeoJSON.Point>;
  selectedPoint: GeoJSON.Feature<GeoJSON.Point> | null;
  cursorStyle: string;

  constructor(private dashboardService: DashboardService, private mapbox: MapboxService) {

  }



  ngOnInit() {
    this.dashboardService.loadDropOnMapsListen();
  }
  status: boolean = false;
  status2: boolean = false;
  addClass() {
    this.status = !this.status;
  }

  addClass2() {
    this.status2 = !this.status2;
  }



  alert(message: string) {
    alert(message);
  }

  onClick(evt: MapMouseEvent) {
    this.selectedPoint = null;
    //this.ChangeDetectorRef.detectChanges();
    this.selectedPoint = (<any>evt).features[0];
  }

  ngAfterViewInit() {
    this.mapbox.initMap();
    this.mapbox.map.on("load", () => {

      //Driver
      this.mapbox.map.addSource("drivers", this.dashboardService.formatedData);
      this.mapbox.map.addLayer({
        "id": "drivers",
        "type": "symbol",
        "source": "drivers",
        "layout": {
          'icon-image': '{icon}',
          'icon-allow-overlap': true,
          "text-field": '{execution_order}',
          'text-offset': [0, 1.5]
        },
        paint: {
          'text-color': '#00ff00',
          'text-halo-color': '#fff',
          'text-halo-width': 2
        }
      });

      //Drops
      this.mapbox.map.addSource("points", this.dashboardService.formatedData);
      this.mapbox.map.addLayer({
        "id": "points",
        "type": "symbol",
        "source": "points",
        "layout": {
          'icon-image': '{icon}',
          'icon-allow-overlap': true,
          "text-field": '{execution_order}',
        }
      });


      //Show POPUP on clicks
    this.mapbox.map.on('click', 'points', function (e) {
      var coordinates = e.features[0].geometry.coordinates.slice();
      var description = e.features[0].properties.description;
      while (Math.abs(e.lngLat.lng - coordinates[0]) > 180) {
          coordinates[0] += e.lngLat.lng > coordinates[0] ? 360 : -360;
      }

      new mapboxgl.Popup()
          .setLngLat(coordinates)
          .setHTML(description)
          .addTo(this);
     });

    });

  }
}


