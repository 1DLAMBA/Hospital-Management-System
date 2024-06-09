import { Component, OnInit } from '@angular/core';
import { UserService } from '../../../endpoints/user.service';

@Component({
  selector: 'app-appointment',
  templateUrl: './appointment.component.html',
  styleUrl: './appointment.component.css'
})
export class AppointmentComponent implements OnInit {
  id: any;
  user: any;


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
        // this.initializeNav();
        
      }
    })
   
  }


}
