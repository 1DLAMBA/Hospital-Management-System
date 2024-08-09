import { HttpClient } from '@angular/common/http';
import { TemplateRef } from '@angular/core';
import { Component } from '@angular/core';
import { Router } from '@angular/router';
import { NgbModal } from '@ng-bootstrap/ng-bootstrap';
import { AuthService } from '../auth.service';

@Component({
  selector: 'app-nav-bar',
 
  templateUrl: './nav-bar.component.html',
  styleUrl: './nav-bar.component.css'
})
export class NavBarComponent {
  constructor(
    private authService: AuthService,
    private _http:HttpClient,
    private modalService: NgbModal,
    private router: Router
  ){

  }
  openFullscreen(content: TemplateRef<any>) {
		this.modalService.open(content, { fullscreen: true });
	}
  login(){
    console.log(this.authService.user);
    if(this.authService.user){
      if(this.authService.user.user.user_type=='doctor'){
        this.router.navigate(['panel/doctor-appointment'])
      } else if(this.authService.user.user.user_type=='client'){
        this.router.navigate(['panel/client-appointment'])
      } else if(this.authService.user.user.user_type=='nurse'){
        this.router.navigate(['panel/assignment'])
      }
    } else {
      this.router.navigate(['login'])

    }
  }
}
