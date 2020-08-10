import { Injectable, OnInit } from '@angular/core';
import { MapComponent } from '../map/map.component'
import { HttpClient, HttpHeaders, HttpResponse } from '@angular/common/http';
import { Router } from '@angular/router';
import { Intersection } from './intersection';
import { Observable } from 'rxjs';
import { map } from 'rxjs/operators';


@Injectable({
  providedIn: 'root'
})
export class MapService {

  token: String;

  constructor(
    private httpClient: HttpClient,
    private router: Router,

  ) { }

  async getIntersections() {
    console.log('MapService')

    this.token = window.localStorage.getItem('token')
    const headers = new HttpHeaders({
      'Content-Type': 'application/json',
      'Authorization': 'Bearer ' + this.token
    });
    const promise = this.httpClient.get('http://localhost:3000/api/intersection',
      {
        headers: headers,

      })
      //.toPromise()
    const intersection = await promise
    console.log('This', intersection)
    return this.httpClient.get<Intersection[]>('http://localhost:3000/api/intersection',
      {
        headers: headers,
      })
  }
}
