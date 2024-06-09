import { Component, OnInit } from '@angular/core';
import { UserResource } from '../../../../../resources/user.model';
import { UserService } from '../../../../endpoints/user.service';
import { environment } from '../../../../../environments/environment';
import { DoctorsService } from '../../../../endpoints/doctors.service';
import { response } from 'express';
import { DoctorResource } from '../../../../../resources/doctor.model';
import { Table } from 'primeng/table';
import {
  Router, ActivatedRoute,
  ActivatedRouteSnapshot,
  Route,
} from '@angular/router';


@Component({
  selector: 'app-client-doctor',
  templateUrl: './client-doctor.component.html',
  styleUrl: './client-doctor.component.css'
})
export class ClientDoctorComponent implements OnInit{
  id: any;
  user!: UserResource;
  firstName!: string;
  avatar_file!:string;
  doctors!: DoctorResource[];
  SingleDoctor!: DoctorResource;
  searchValue: string | undefined;
  showdoc: boolean = false;

  constructor(
    private userEndpoint: UserService,
    private doctorEndpoint: DoctorsService,
    private readonly router: Router,

  ){

  }

  ngOnInit(): void {
    this.id=localStorage.getItem('id');
    this.getUser();
    this.getDoctor();
  }

  clear(table: Table) {
    table.clear();
    this.searchValue = ''
}

  getUser (){
    this.userEndpoint.get(this.id).subscribe({
      next: (response: any) => {
        this.user = response.user
        this.avatar_file = environment.apiUrl + '/file/get/';        
      }
    })
  }

  getDoctor(){
    this.doctorEndpoint.get().subscribe({
      next: (response: any) => {
        this.doctors = response.doctor;


      }
    })
  }

  getSingleDoctor(id: any){
    this.doctorEndpoint.getSingle(id).subscribe({
      next: (response: any) => {
        this.showdoc=true;
        this.SingleDoctor = response.doctor;
        this.router.navigate([`/doctors/profile/${this.SingleDoctor.id}`])
      }
    })
  }

  

}
