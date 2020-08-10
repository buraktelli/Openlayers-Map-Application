import { NgModule } from '@angular/core';
import { Routes, RouterModule } from '@angular/router';
import { LoginComponent } from './login/login.component';
import { AppComponent } from './app.component';
import { MapComponent } from './map/map.component';
import { RegisterComponent } from './register/register.component';

const routes: Routes = [
  { path: 'login-component', component: LoginComponent },
  { path: 'map-component', component: MapComponent },
  { path: 'register-component', component: RegisterComponent },
  { path: '', redirectTo: '/login-component', pathMatch: 'full' },
];

@NgModule({
  imports: [RouterModule.forRoot(routes)],
  exports: [RouterModule]
})
export class AppRoutingModule { }
