import { Component, OnInit } from '@angular/core';
import { MessageService } from 'primeng/api';
import { UserResource } from '../../../resources/user.model';
import { UserService } from '../../endpoints/user.service';
import { environment } from '../../../environments/environment';


@Component({
  selector: 'app-dashboard',
  templateUrl: './dashboard.component.html',
  styleUrl: './dashboard.component.css'
})
export class DashboardComponent implements OnInit {
  id: any;
  user!: UserResource
  firstName!: string;
  avatar_file!:string;

  constructor(
    private messageService: MessageService,
    private userEndpoint: UserService
  ){

  }
  ngOnInit(): void {
    this.id=localStorage.getItem('id')
    this.getUser();
  }

  getUser (){
    this.userEndpoint.get(this.id).subscribe({
      next: (response: any) => {
        this.user = response.user
        console.log(response.user.name.split(" "))
        const splitNames= this.user.name.split(" ");
        this.firstName = splitNames[0];
        this.show(this.firstName);
        this.avatar_file = environment.apiUrl + '/file/get/';        
      }
    })
  }
  show(firstname: any) {

    this.messageService.add({ icon: ' bi bi-person', severity: 'success', detail: `Hello, ${firstname}`  });
    console.log(this.user);
    
  }
}
