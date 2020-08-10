import { Component, OnInit } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Router } from "@angular/router"

@Component({
  selector: 'app-register',
  templateUrl: './register.component.html',
  styleUrls: ['./register.component.css']
})
export class RegisterComponent implements OnInit {

  constructor(
    private httpClient: HttpClient,
    private router: Router
  ) { }

  ngOnInit(): void {
  }

  register(data) {
    this.httpClient.post('http://localhost:3000/api/register/',
      {
        username: data.Username,
        password: data.password
      }).subscribe((f: any) => {
        console.log(f.token);
        this.router.navigate(['/map-component', { token: f.token }])
      },
        response => {
          console.log('response', response)
        });
  }
}
