import { Component, OnInit, OnDestroy } from '@angular/core';
import { UserService } from '../../../endpoints/user.service';
import { UserResource } from '../../../../resources/user.model';
import { environment } from '../../../../environments/environment';
import { Router, NavigationEnd } from '@angular/router';
import { Subscription } from 'rxjs';
import { filter } from 'rxjs/operators';


@Component({
  selector: 'app-doctors',
  templateUrl: './doctors.component.html',
  styleUrl: './doctors.component.css'
})
export class DoctorsComponent implements OnInit, OnDestroy {
  id: any;
  user!: UserResource
  firstName!: string;
  avatar_file!:string;
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
    
    // Subscribe to router navigation events to detect when navigating to this component
    this.routerSubscription = this.router.events.pipe(
      filter((event): event is NavigationEnd => event instanceof NavigationEnd)
    ).subscribe((event) => {
      if (!this.isComponentActive) return;
      
      const currentUrl = event.urlAfterRedirects || event.url;
      
      // If we're on the doctors route, reload data
      if (currentUrl.includes('/panel/doctors')) {
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
        this.avatar_file = environment.apiUrl + '/file/get/';        
      }
    })
  }
  
  show(firstname: any) {
    // this.messageService.add({ icon: ' bi bi-person', severity: 'success', detail: `Hello, ${firstname}`  });
    console.log(this.user);
  }
}
