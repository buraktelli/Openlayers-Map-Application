import { AfterViewInit, Component, ViewChild, ElementRef, OnInit } from '@angular/core';
import { defaults as defaultControls, ZoomSlider } from 'ol/control';

import Map from 'ol/Map';
import View from 'ol/View';
import TileLayer from 'ol/layer/Tile';
import XYZ from 'ol/source/XYZ';
import ZoomToExtent from 'ol/control/ZoomToExtent';
import { fromLonLat } from 'ol/proj';
import MousePosition from 'ol/control/MousePosition';
import { createStringXY } from 'ol/coordinate';
import OSM from 'ol/source/OSM.js'

import 'ol/ol.css';
import Feature from 'ol/Feature';
import Geolocation from 'ol/Geolocation';
import Point from 'ol/geom/Point';
import { Vector as VectorSource, ImageWMS, Cluster } from 'ol/source';
import { Circle, Fill, Stroke, Text, RegularShape, Icon } from 'ol/style';
import { Vector as VectorLayer } from 'ol/layer';
import { MapBrowserEvent, MapEvent } from 'ol';
import Overlay from 'ol/Overlay';
import ImageLayer from 'ol/layer/Image';
import BaseEvent from 'ol/events/Event';
import { disable } from 'ol/rotationconstraint';

import 'ol/ol.css';
import { toStringHDMS } from 'ol/coordinate';
import { toLonLat } from 'ol/proj';
import TileJSON from 'ol/source/TileJSON';
import { mapToMapExpression } from '@angular/compiler/src/render3/util';
import Style, { StyleLike } from 'ol/style/Style';
import OverlayPositioning from 'ol/OverlayPositioning';
import { HttpClient, HttpHeaders } from '@angular/common/http';
import Select, { SelectEvent } from 'ol/interaction/Select';
import { click, pointerMove, altKeyOnly } from 'ol/events/condition';
import Draw from 'ol/interaction/Draw';
import Polygon from 'ol/geom/Polygon';
import Geometry from 'ol/geom/Geometry';
import GeometryType from 'ol/geom/GeometryType';
import Static from 'ol/source/ImageStatic';
import WKT from 'ol/format/WKT';
import { ActivatedRoute, Router } from '@angular/router';
import { MapService } from './map.service';



var istanbul = fromLonLat([28.9744, 41.0128]);
@Component({
  selector: 'app-map',
  templateUrl: './map.component.html',
  styleUrls: ['./map.component.scss'],
  providers: [MapService]
})
export class MapComponent implements OnInit {
  @ViewChild('map', { static: true }) mapRef: ElementRef<HTMLDivElement>;
  @ViewChild('mousePosition', { static: true }) mousePositionRef: ElementRef<HTMLDivElement>;
  @ViewChild('popup', { static: true }) popupRef: ElementRef<HTMLElement>;

  overlay: Overlay;
  mouseOver: boolean;
  map: Map;
  selectPointerMove: any;
  selectPointerClick: any;
  opnvKarteTileLayer: TileLayer;
  cartoDarkTileLayer: TileLayer;
  osmTileLayer: TileLayer;
  vectorLayer: VectorLayer;
  mousePositionControl: MousePosition;
  popupObj: any = {}
  addedFeatures: any[]
  features: any[]
  point: Point
  style: Style
  style2: Style
  token: String;
  f: any[]
  constructor(
    private httpClient: HttpClient,
    private route: ActivatedRoute,
    private router: Router,
    private mapService: MapService
  ) { }

  mapClickFunction = (evt: MapBrowserEvent) => {

    const coord = evt.coordinate;
    const point = new Point(coord) as Point
    const feature = new Feature(point);

    //if (this.addedFeatures.length != 0) {
    feature.setProperties({
      name: 'Click ile eklenen name',
      type: 'Click ile eklenen content',
      coord: false
    })
    this.addedFeatures.push(feature);
    this.vectorLayer.getSource().addFeature(feature)
    //}
    //this.features.push(this.addedFeatures);
    // const x = this.vectorLayer.getSource().getFeatures()[0].getGeometry().getClosestPoint(evt.coordinate);
  }
  selectPointerMoveFunction = (evt: SelectEvent) => {
    const headers = new HttpHeaders({
      'Content-Type': 'application/json',
      'Authorization': 'Bearer ' + this.token
    })
    if (evt.selected[0]) {
      evt.selected[0].setStyle(this.style);
      const id = evt.selected[0].getProperties().id
      this.httpClient.get('http://localhost:3000/api/intersection/update/' + id,
        {
          headers: headers
        }).subscribe((f) => {
          console.log('Updated', f)
        })
    }
  }
  selectPointerClickFunction = (evt: SelectEvent) => {
    const headers = new HttpHeaders({
      'Content-Type': 'application/json',
      'Authorization': 'Bearer ' + this.token
    })
    if (evt.selected[0]) {
      const id = evt.selected[0].getProperties().id
      // this.httpClient.get('http://localhost:3000/api/intersections/delete/' + id).subscribe((f) => {
      //   console.log('Deleted', f)
      // })
      this.httpClient.delete('http://localhost:3000/api/intersection/' + id,
        {
          headers: headers
        }).subscribe((f) => {
          console.log('Deleted', f)
        })
    }
  }

  ngOnInit() {
    // this.token = this.route.snapshot.paramMap.get('token');
    this.token = window.localStorage.getItem('token')
    this.mousePositionControl = new MousePosition({
      coordinateFormat: createStringXY(4),
      projection: 'EPSG:4326',
      className: 'custom-mouse-position',
      target: this.mousePositionRef.nativeElement,
      undefinedHTML: '&nbsp;'
    });
    this.osmTileLayer = new TileLayer({
      source: new XYZ({
        url: 'https://{a-c}.tile.openstreetmap.org/{z}/{x}/{y}.png'
      }),
      visible: true
    });
    this.cartoDarkTileLayer = new TileLayer({
      source: new XYZ({
        url: 'https://cartodb-basemaps-1.global.ssl.fastly.net/dark_all/{z}/{x}/{y}.png'
      }),
      visible: false
    });
    this.opnvKarteTileLayer = new TileLayer({
      source: new XYZ({
        url: 'http://tile.memomaps.de/tilegen/{z}/{x}/{y}.png'
      }),
      visible: false
    });
    this.map = new Map({
      target: this.mapRef.nativeElement,
      layers: [
        this.osmTileLayer,
        this.cartoDarkTileLayer,
        this.opnvKarteTileLayer,
      ],
      view: new View({
        center: istanbul,
        projection: 'EPSG:3857',
        zoom: 8
      }),
      controls: defaultControls().extend([
        this.mousePositionControl,
      ]),
    });
    (window as any).map = this.map;
    this.map.on('click', this.mapClickFunction);

    this.selectPointerMove = new Select({
      condition: pointerMove
    })
    this.selectPointerClick = new Select({
      condition: click
    })
    this.map.addInteraction(this.selectPointerMove);
    this.map.addInteraction(this.selectPointerClick);
    this.selectPointerMove.un('select', this.selectPointerMoveFunction)
    this.selectPointerClick.un('select', this.selectPointerClickFunction)

    const styleCache = {}

    this.vectorLayer = new VectorLayer({
      source: new VectorSource(),
      style: (feature: any) => {
        const s = styleCache[0]
        const s2 = styleCache[1]
        if (!(s && s2)) {
          styleCache[0] = this.style
          styleCache[1] = this.style2
        }
        if (feature.values_.type == 'vd') {
          return s
        }
        return s2
      }

    });
    this.map.addLayer(this.vectorLayer);

    var view = new View();
    var geolocation = new Geolocation({
      // enableHighAccuracy must be set to true to have the heading value.
      trackingOptions: {
        enableHighAccuracy: true
      },
      projection: view.getProjection()
    });
    var accuracyFeature = new Feature();
    geolocation.on('change:accuracyGeometry', function () {
      accuracyFeature.setGeometry(geolocation.getAccuracyGeometry());
    });
    var positionFeature = new Feature();
    positionFeature.setStyle(new Style({
      image: new Circle({
        radius: 6,
        fill: new Fill({
          color: '#3399CC'
        }),
        stroke: new Stroke({
          color: '#fff',
          width: 2
        })
      })
    }));
    geolocation.on('change:position', function () {
      var coordinates = geolocation.getPosition();
      positionFeature.setGeometry(coordinates ?
        new Point(coordinates) : null);
    });
    new VectorLayer({
      map: this.map,
      source: new VectorSource({
        features: [accuracyFeature, positionFeature]
      })
    });
    geolocation.setTracking(true);

    //this.vectorLayer.getSource().addFeature(this.feature);

    this.features = [];
    this.addedFeatures = []

    this.overlay = new Overlay({
      positioning: OverlayPositioning.BOTTOM_LEFT,
      element: this.popupRef.nativeElement
    });
    this.map.addOverlay(this.overlay);

    this.style = new Style({
      image: new RegularShape({
        stroke: new Stroke({
          color: 'red',
          width: 2
        }),
        points: 7,
        radius: 5,
        angle: Math.PI / 4,
        fill: new Fill({
          color: 'blue'
        })
      })
    })
    this.style2 = new Style({
      image: new Icon({
        src:
          'https://www.marinedealnews.com/wp-content/uploads/2018/12/adres-icon.png',
        scale: 0.05
      })
    })
    this.map.on('pointermove', (e: MapBrowserEvent) => {
      const features = this.map.getFeaturesAtPixel(e.pixel) as Feature<Point>[];
      if (features.length === 0) {
        this.overlay.setPosition(undefined);
        return;
      }
      const f = features[0];
      const point = f.getGeometry() as Point;
      const coordinate = point.getFirstCoordinate();
      this.overlay.setPosition(coordinate);
      this.popupObj.id = features[0].getProperties().id;
      this.popupObj.name = features[0].getProperties().name;
      this.popupObj.type = features[0].getProperties().type;

      if (features[0].getProperties().coord) {
        this.popupObj.coord = features[0].getProperties().coord;
      } else {
        this.point = new Point(coordinate).transform('EPSG:3857', 'EPSG:4326') as Point
        this.popupObj.coord = this.point.getFlatCoordinates();
      }
    });

  }

  changeMod() {
    this.mouseOver = !this.mouseOver;
    if (!this.mouseOver) {
      this.map.on('click', this.mapClickFunction);
      this.selectPointerMove.un('select', this.selectPointerMoveFunction)
      this.selectPointerClick.un('select', this.selectPointerClickFunction)
    } else {
      this.map.un('click', this.mapClickFunction);
      this.selectPointerMove.on('select', this.selectPointerMoveFunction)
      this.selectPointerClick.on('select', this.selectPointerClickFunction)
    }
  }
  changeBasemap() {
    const isOSMEnabled = this.osmTileLayer.getVisible();
    this.osmTileLayer.setVisible(!isOSMEnabled);
    this.cartoDarkTileLayer.setVisible(isOSMEnabled);
  }
  // sleep(time: number) {
  //   return new Promise((resolve, reject) => {
  //     setTimeout(() => {
  //       resolve(time*2)

  //     }, time);
  //   }).then((res) => {
  //     console.log(res)
  //     return res;
  //   }).catch((err) => {
  //     console.log(err)
  //   })
  // }
  async getAllIntersections() {
    // this.mapService.getIntersections().subscribe((f) => {
    //   console.log(f)
    //   this.f = f
    // });
    const promise = (await this.mapService.getIntersections()).toPromise()
    this.f = await promise;

    promise.then(res => {
      // console.log('promise', res);
    })
    // const patates = await this.sleep(200)
    // console.log('patates', patates)

    this.f.map((current, index, arr) => {
      const feature = new Feature(new Point([current.geom.coordinates[0], current.geom.coordinates[1]]).transform('EPSG:4326', 'EPSG:3857') as Point);
      feature.setProperties({
        name: current.name,
        type: current.intersection_type,
        id: current.id,
        coord: current.coord
      })
      this.features.push(feature);
      this.addedFeatures = this.features;
      return { key: index, value: current };
    })
    this.vectorLayer.getSource().addFeatures(this.features)

  }
  insert() {
    if (this.token == null) {
      alert('Login olmadan islem yapamazsınız !')
      this.router.navigate(['/login-component'])
      return
    }
    const headers = new HttpHeaders({
      'Content-Type': 'application/json',
      'Authorization': 'Bearer ' + this.token
    })
    this.httpClient.post('http://localhost:3000/api/intersection/insert/',
      {
        name: 'Java Functional Interface',
        x: this.point.getFlatCoordinates()[0],
        y: this.point.getFlatCoordinates()[1]
      },
      {
        headers: headers
      }).subscribe((f) => {
        console.log(f);
      }, response => {
        console.log('response', response)
      });
  }







  // draw() {
  //   this.httpClient.post('http://localhost:3000/api/intersections/envelope',
  //     {
  //       name: 'Java Functional Interface',
  //       address: 'Java 8',
  //       code: 'Krishna',
  //       ip_address: (Math.floor(Math.random() * 600) + 1).toString(),
  //       x: this.point.getFlatCoordinates()[0],
  //       y: this.point.getFlatCoordinates()[1]
  //     }).subscribe((f) => {
  //       console.log(f)
  //       //const feature = new Feature(new Point([28, 40]).transform('EPSG:4326', 'EPSG:3857') as Point);
  //       const format = new WKT()
  //       const feat = format.readGeometry(f, {
  //         dataProjection: 'EPSG:4326',
  //         featureProjection: 'EPSG:3857'
  //       })
  //       const feature = new Feature()
  //       feature.setGeometry(feat);
  //       //this.vectorLayer.getSource().addFeature(feature)
  //       this.vectorLayer.getSource().addFeature(feature)
  //       console.log(feature)
  //     })
  // }
}
