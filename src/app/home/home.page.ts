import { Component } from '@angular/core';

import { Platform } from '@ionic/angular';

import { GoogleMaps, GoogleMap, MarkerOptions } from '@ionic-native/google-maps/ngx'

import { Geolocation } from '@ionic-native/geolocation/ngx';

@Component({
  selector: 'app-home',
  templateUrl: 'home.page.html',
  styleUrls: ['home.page.scss'],
})
export class HomePage {
  //variable del mapa global
  map: GoogleMap;

  //lista de marcadores, posiciones.
  markers: MarkerOptions[] = [
    {
      title: "marcador1",
      position: {
        lat: -33.0388212,
        lng: -71.4101412
      }
    },
    {
      title: "marcador2",
      position: {
        lat: -33.039314,
        lng: -71.410929
      }
    },
    {
      title: "marcador3",
      position: {
        lat: -33.042189,
        lng: -71.399697
      }
    },
    {
      title: "marcador4",
      position: {
        lat: -33.031575,
        lng: -71.404726
      }
    }
  ];

  constructor(private platform: Platform, private geolocation: Geolocation) { }

  async ngOnInit() {
    await this.platform.ready();
    await this.loadMap();
  }

  loadMap() {
    //al div que tenga id="map_canvas" se le asigna el mapa
    this.map = GoogleMaps.create('map_canvas');
    //activa boton de ir a mi ubicacion
    this.map.setMyLocationEnabled(true)
    this.map.setMyLocationButtonEnabled(true);
    //seteo el zoom en 14
    this.map.setCameraZoom(14)

    //al habrir la app se mueve el mapa a mi ubicacion
    this.geolocation.getCurrentPosition().then((resp) => {

      var miUbicacion  = {
        lat: resp.coords.latitude,
        lng: resp.coords.longitude,
      }
      
      this.map.setCameraTarget(miUbicacion)

    }).catch((error) => {
      console.log('Error getting location', error);
    });


    this.calcularYmostrarSoloPuntosCercanos()
  }



  cambiarEntreCercanosYTodos(ev: any) {
    // map.clear() borra todos los marcadores del mapa, se hace esto porque marker.visible = false no funciona, nose porque xd.
    // pero se borran todos y agregan al mapa los marcadores solo a 1 km y en su contrario se muestran todos
    this.map.clear()

    if (ev.detail.value == "cercanos") {
      console.log("mostrando CERCANOS");
      this.calcularYmostrarSoloPuntosCercanos()
    }
    else {
      console.log("mostrando TODOS");
      this.markers.forEach(marker => {
        this.map.addMarker(marker)
        console.log(marker.title + " " + marker.visible)
      });
    }

  }


  calcularYmostrarSoloPuntosCercanos() {

    this.map.getMyLocation().then(miPosicion => {

      this.markers.forEach(marker => {
        //se muestran los que estan a menos de 1 km
        if (parseFloat(this.distanciaEntre2Coordenadas(miPosicion.latLng.lat, miPosicion.latLng.lng, marker.position.lat, marker.position.lng)) < 1) {
          console.log(marker.title + "esta lejos")
          this.map.addMarker(marker)
        }

      });

    })


  }

  //esta formula es rara porque no uso la de distancia entre 2 puntos porque al usar esa formula se toma en cuenta un plano plano valga la redundancia, pero la tierra es esferica
  //entonces se debe considerar la curvatura de la tierra en el calculo.
  distanciaEntre2Coordenadas(lat1, lon1, lat2, lon2) {
    var rad = function (x) {
      return x * Math.PI / 180;
    }

    var R = 6378.137;//Radio de la tierra en km
    var dLat = rad(lat2 - lat1);
    var dLong = rad(lon2 - lon1);
    var a = Math.sin(dLat / 2) * Math.sin(dLat / 2) + Math.cos(rad(lat1)) * Math.cos(rad(lat2)) * Math.sin(dLong / 2) * Math.sin(dLong / 2);
    var c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
    var d = R * c;
    return d.toFixed(3);//Retorna tres decimales
  }




}
