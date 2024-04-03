import { Component, OnInit } from '@angular/core';
import { UserService } from '../../../endpoints/user.service';
import { UserResource } from '../../../../resources/user.model';

@Component({
  selector: 'app-panel',
 
  templateUrl: './panel.component.html',
  styleUrl: './panel.component.css'
})
export class PanelComponent implements OnInit {
  id: any;
  user!: UserResource

  constructor(private userEndpoint: UserService){
    
  }
  ngOnInit(): void {
    this.id=localStorage.getItem('id')
  }
  
  getUser (){
    this.userEndpoint.get(this.id).subscribe({
      next: (response: any) => {
        this.user = response.user
        
      }
    })
  }

}
