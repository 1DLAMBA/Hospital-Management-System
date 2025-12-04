import { HttpClient } from '@angular/common/http';
import { TemplateRef } from '@angular/core';
import { Component, OnInit } from '@angular/core';
import { Router } from '@angular/router';
import { NgbModal } from '@ng-bootstrap/ng-bootstrap';
import { AuthService } from '../auth.service';
import { environment } from '../../environments/environment';

@Component({
  selector: 'app-nav-bar',
 
  templateUrl: './nav-bar.component.html',
  styleUrl: './nav-bar.component.css'
})
export class NavBarComponent implements OnInit {
  avatar_file: string = environment.apiUrl + '/file/get/';

  constructor(
    private authService: AuthService,
    private _http:HttpClient,
    private modalService: NgbModal,
    private router: Router
  ){

  }

  ngOnInit(): void {
    // Ensure user data is loaded from localStorage on component init
    this.authService.getUserDataFromLocalStorage();
  }
  openFullscreen(content: TemplateRef<any>) {
		this.modalService.open(content, { fullscreen: true });
	}
  login(){
    console.log(this.authService.user);
    if(this.authService.user){
      if(this.authService.user.user.user_type=='doctor' || this.authService.user.user.user_type=='other_professional'){
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

  navigateToDashboard() {
    if(this.authService.user && this.authService.user.user){
      const userId = localStorage.getItem('id');
      const userType = this.authService.user.user.user_type;
      
      switch(userType) {
        case 'doctor':
        case 'other_professional':
          this.router.navigate(['panel/doctor-panel', userId]);
          break;
        case 'client':
          this.router.navigate(['panel/client-panel']);
          break;
        case 'nurse':
          this.router.navigate(['panel/nurse-panel']);
          break;
        default:
          this.router.navigate(['login']);
      }
    } else {
      this.router.navigate(['login']);
    }
  }

  get user() {
    return this.authService.user;
  }

  get isLoggedIn() {
    return this.authService.isLoggedIn && this.authService.user;
  }
}
