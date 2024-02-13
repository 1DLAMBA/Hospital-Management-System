import { HttpClient } from '@angular/common/http';
import { TemplateRef } from '@angular/core';
import { Component } from '@angular/core';
import { Router } from '@angular/router';
import { NgbModal } from '@ng-bootstrap/ng-bootstrap';

@Component({
  selector: 'app-nav-bar',
 
  templateUrl: './nav-bar.component.html',
  styleUrl: './nav-bar.component.css'
})
export class NavBarComponent {
  constructor(

    private _http:HttpClient,
    private modalService: NgbModal,
    private router: Router
  ){

  }
  openFullscreen(content: TemplateRef<any>) {
		this.modalService.open(content, { fullscreen: true });
	}
  login(){
    this.router.navigate(['login'])
  }
}
