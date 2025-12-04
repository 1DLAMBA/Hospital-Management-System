import { Component, OnInit, OnDestroy } from '@angular/core';
import { UserResource } from '../../../resources/user.model';
import { UserService } from '../../endpoints/user.service';
import { Router, NavigationEnd } from '@angular/router';
import { Subscription } from 'rxjs';
import { filter } from 'rxjs/operators';

@Component({
  selector: 'app-side-nav',
  templateUrl: './side-nav.component.html',
  styleUrl: './side-nav.component.css'
})
export class SideNavComponent implements OnInit, OnDestroy {
  id: any;
  user!: UserResource;
  nav_type!: any[];
  doctor_nav!: any[];
  other_professional_nav!: any[];
  client_nav!: any[];
  nurse_nav!: any[];
  admin_nav!: any[];
  private routerSubscription?: Subscription;
  private isComponentActive: boolean = true;

  constructor(
    private userEndpoint: UserService,
    private router: Router
  ){
    
  }
  
  ngOnInit(): void {
    this.id=localStorage.getItem('id')
    this.isComponentActive = true;
    this.loadData();
    
    // Subscribe to router navigation events to reload data when navigating
    this.routerSubscription = this.router.events.pipe(
      filter((event): event is NavigationEnd => event instanceof NavigationEnd)
    ).subscribe((event) => {
      if (!this.isComponentActive) return;
      
      const currentUrl = event.urlAfterRedirects || event.url;
      
      // Reload data when navigating to any panel route
      if (currentUrl.startsWith('/panel')) {
        setTimeout(() => {
          if (this.isComponentActive && this.router.url === currentUrl) {
            this.loadData();
          }
        }, 100);
      }
    });
  }

  ngOnDestroy(): void {
    this.isComponentActive = false;
    if (this.routerSubscription) {
      this.routerSubscription.unsubscribe();
    }
  }

  loadData(): void {
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
      routerLink: 'doctor-panel/' + this.id,
    },
    {
      navClassName:'side-btn bi bi-prescription2 my-2 py-3',
      title: 'Appointment',
      routerLink: 'doctor-appointment'
    },
    // {
    //   navClassName:'side-btn bi bi-heart-pulse-fill my-2 py-3',
    //   title: 'Nurses',
    //   routerLink: 'nurses'
    // },
    // {
    //   navClassName:'side-btn bi bi-person-square my-2 py-3',
    //   title: 'Clients',
    //   routerLink: 'clients'
    // },
    {
      navClassName:'side-btn bi bi-chat-right-text-fill my-2 py-3',
      title: 'Messages',
      routerLink: 'messages'
    },
    {
      navClassName:'side-btn bi bi-robot my-2 py-3',
      title: 'Medical AI',
      routerLink: 'medical-ai'
    },
    {
      navClassName:'side-btn bi bi-person-circle my-2 py-3',
      title: 'My Profile',
      routerLink: `my-profile/doctor/${this.id}`
    },
  ]
    this.other_professional_nav =[{
      navClassName:'side-btn bi bi-columns-gap my-2 py-3',
      title: 'Dashboard',
      routerLink: 'doctor-panel/' + this.id,
    },
    {
      navClassName:'side-btn bi bi-prescription2 my-2 py-3',
      title: 'Appointment',
      routerLink: 'doctor-appointment'
    },
    {
      navClassName:'side-btn bi bi-chat-right-text-fill my-2 py-3',
      title: 'Messages',
      routerLink: 'messages'
    },
    {
      navClassName:'side-btn bi bi-robot my-2 py-3',
      title: 'Medical AI',
      routerLink: 'medical-ai'
    },
    {
      navClassName:'side-btn bi bi-person-circle my-2 py-3',
      title: 'My Profile',
      routerLink: `my-profile/doctor/${this.id}`
    },
  ]
    this.client_nav =[{
      navClassName:'side-btn bi bi-columns-gap my-2 py-3',
      title: 'Dashboard',
      routerLink: ['client-panel'],
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
    // {
    //   navClassName:'side-btn bi bi-heart-pulse-fill my-2 py-3',
    //   title: 'Nurses',
    //   routerLink: ['nurses']
    // },
    {
      navClassName:'side-btn bi bi-chat-right-text-fill my-2 py-3',
      title: 'Messages',
      routerLink: 'messages'
    },
    {
      navClassName:'side-btn bi bi-robot my-2 py-3',
      title: 'Medical AI',
      routerLink: 'medical-ai'
    },
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
    {
      navClassName:'side-btn bi bi-robot my-2 py-3',
      title: 'Medical AI',
      routerLink: 'medical-ai'
    },
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
      case 'other_professional':
        this.nav_type = this.other_professional_nav
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