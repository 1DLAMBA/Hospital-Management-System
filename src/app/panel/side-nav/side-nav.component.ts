import { Component, OnInit } from '@angular/core';
import { UserResource } from '../../../resources/user.model';
import { UserService } from '../../endpoints/user.service';

@Component({
  selector: 'app-side-nav',
  templateUrl: './side-nav.component.html',
  styleUrl: './side-nav.component.css'
})
export class SideNavComponent implements OnInit {
  id: any;
  user!: UserResource;
  nav_type!: any[];
  doctor_nav!: any[];
  client_nav!: any[];
  nurse_nav!: any[];
  admin_nav!: any[];

  constructor(private userEndpoint: UserService){
    
  }
  ngOnInit(): void {
    this.id=localStorage.getItem('id')
    this.getUser();
  }
  getUser (){
    this.userEndpoint.get(this.id).subscribe({
      next: (response: any) => {
        this.user = response.user
        this.initializeNav();
        
      }
    })
   
  }

  initializeNav(){
    this.doctor_nav =[{
      navClassName:'side-btn bi bi-columns-gap my-2 py-3',
      title: 'Dashboard',
      routerLink: 'doctor-panel',
    },
    {
      navClassName:'side-btn bi bi-prescription2 my-2 py-3',
      title: 'Appointment',
      routerLink: 'doctor-appointment'
    },
    {
      navClassName:'side-btn bi bi-heart-pulse-fill my-2 py-3',
      title: 'Nurses',
      routerLink: 'nurses'
    },
    {
      navClassName:'side-btn bi bi-person-square my-2 py-3',
      title: 'Clients',
      routerLink: 'clients'
    },
    {
      navClassName:'side-btn bi bi-chat-right-text-fill my-2 py-3',
      title: 'Messages',
      routerLink: 'messages'
    },
    // {
    //   navClassName:'side-btn bi bi-robot my-2 py-3',
    //   title: 'Medical AI',
    //   routerLink: 'medical-ai'
    // },
    {
      navClassName:'side-btn bi bi-person-circle my-2 py-3',
      title: 'My Profile',
      routerLink: `my-profile/doctor/${this.id}`
    },
  ]
    this.client_nav =[{
      navClassName:'side-btn bi bi-columns-gap my-2 py-3',
      title: 'Dashboard',
      routerLink: 'client-panel',
    },
    {
      navClassName:'side-btn bi bi-prescription2 my-2 py-3',
      title: 'Appointment',
      routerLink: 'client-appointment'
    },
    {
      navClassName:'side-btn bi bi-person-square my-2 py-3',
      title: 'Doctors',
      routerLink: 'doctors'
    },
    {
      navClassName:'side-btn bi bi-heart-pulse-fill my-2 py-3',
      title: 'Nurses',
      routerLink: 'nurses'
    },
    {
      navClassName:'side-btn bi bi-chat-right-text-fill my-2 py-3',
      title: 'Messages',
      routerLink: 'messages'
    },
    // {
    //   navClassName:'side-btn bi bi-robot my-2 py-3',
    //   title: 'Medical AI',
    //   routerLink: 'medical-ai'
    // },
    {
      navClassName:'side-btn bi bi-person-circle my-2 py-3',
      title: 'My Profile',
      routerLink: `my-profile/client/${this.id}`
    },
  ]
    this.nurse_nav =[{
      navClassName:'side-btn bi bi-columns-gap my-2 py-3',
      title: 'Dashboard',
      routerLink: 'nurse-panel',
    },
    {
      navClassName:'side-btn bi bi-prescription2 my-2 py-3',
      title: 'Assignment',
      routerLink: 'assignment'
    },
    {
      navClassName:'side-btn bi bi-person-square my-2 py-3',
      title: 'Clients',
      routerLink: 'clients'
    },
    {
      navClassName:'side-btn bi bi-chat-right-text-fill my-2 py-3',
      title: 'Messages',
      routerLink: 'messages'
    },
    // {
    //   navClassName:'side-btn bi bi-robot my-2 py-3',
    //   title: 'Medical AI',
    //   routerLink: 'medical-ai'
    // },
    {
      navClassName:'side-btn bi bi-person-circle my-2 py-3',
      title: 'My Profile',
      routerLink: `my-profile/nurse/${this.id}`
    },
  ]
    switch (this.user.user_type) {
      case 'doctor':
        this.nav_type = this.doctor_nav
        break;
      case 'nurse':
        this.nav_type = this.nurse_nav
        break;
      case 'client':
        this.nav_type = this.client_nav
        break;
      case 'admin':
        this.nav_type = this.admin_nav
        break;
      default:
        this.nav_type = this.client_nav;
        break;
    }
  }

}