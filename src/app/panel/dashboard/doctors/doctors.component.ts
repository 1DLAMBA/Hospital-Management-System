import { Component, OnInit } from '@angular/core';
import { UserService } from '../../../endpoints/user.service';
import { UserResource } from '../../../../resources/user.model';
import { environment } from '../../../../environments/environment';


@Component({
  selector: 'app-doctors',
  templateUrl: './doctors.component.html',
  styleUrl: './doctors.component.css'
})
export class DoctorsComponent implements OnInit {
  id: any;
  user!: UserResource
  firstName!: string;
  avatar_file!:string;

  constructor(
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
        this.avatar_file = environment.apiUrl + '/file/get/';        
      }
    })
  }
  show(firstname: any) {

    // this.messageService.add({ icon: ' bi bi-person', severity: 'success', detail: `Hello, ${firstname}`  });
    console.log(this.user);
    
  }
}
