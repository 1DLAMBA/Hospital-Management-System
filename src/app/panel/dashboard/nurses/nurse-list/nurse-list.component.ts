import { Component, OnInit } from '@angular/core';
import { environment } from '../../../../../environments/environment';
import { UserResource } from '../../../../../resources/user.model';
import { UserService } from '../../../../endpoints/user.service';
import { NursesService } from '../../../../endpoints/nurses.service';
import { NurseResource } from '../../../../../resources/nurse.model';
import { Table } from 'primeng/table';
import {
  Router, ActivatedRoute,
  ActivatedRouteSnapshot,
  Route,
} from '@angular/router';

@Component({
  selector: 'app-nurse-list',
  templateUrl: './nurse-list.component.html',
  styleUrl: './nurse-list.component.css'
})
export class NurseListComponent implements OnInit{

  id: any;
  user!: UserResource[];
  avatar_file!:string;
  nurses!: NurseResource[];

  constructor(
    private userEndpoint: UserService,
    private nurseEnpoint: NursesService,
    private readonly router: Router,
  ){

  }

  ngOnInit(): void {
    this.id=localStorage.getItem('id');
    this.getUser();
    this.getNurse();
  }

  getSingleNurse(id: any){
    this.userEndpoint.get(this.id).subscribe({
      next: (response: any)=> {
        this.user = response.user;
      }
    })

  }

  getUser(){
    this.userEndpoint.get(this.id).subscribe({
      next: (response: any)=> {
        this.user = response.user;
      }
    })
  }
  getNurse(){
    this.nurseEnpoint.get().subscribe({
      next: (response: any)=>{
        this.nurses = response.nurse
        this.avatar_file = environment.apiUrl + '/file/get/';        

      }
    });
   }

 

}
