import { Component, OnInit } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Router } from "@angular/router"


@Component({
  selector: 'app-first',
  templateUrl: './login.component.html',
  styleUrls: ['./login.component.css']
})
export class LoginComponent implements OnInit {

  constructor(
    private httpClient: HttpClient,
    private router: Router
  ) { }

  ngOnInit(): void {
    localStorage.clear()
  }

  login(data) {
    this.httpClient.post('http://localhost:3000/api/login/',
      {
        username: data.username,
        password: data.password
      }).subscribe((f: any) => {
        localStorage.setItem('token', f.token)
        this.router.navigate(['/map-component'])
      }, response => {
        console.log('response', response)
      });
  }
}
