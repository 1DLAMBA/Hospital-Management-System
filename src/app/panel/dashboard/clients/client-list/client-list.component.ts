import { Component, OnInit } from '@angular/core';
import { environment } from '../../../../../environments/environment';
import { UserResource } from '../../../../../resources/user.model';
import { UserService } from '../../../../endpoints/user.service';
import { ClientsService } from '../../../../endpoints/clients.service';
import { ClientResource } from '../../../../../resources/client.model';
import { Table } from 'primeng/table';
import {
  Router, ActivatedRoute,
  ActivatedRouteSnapshot,
  Route,
} from '@angular/router';
@Component({
  selector: 'app-client-list',
  templateUrl: './client-list.component.html',
  styleUrl: './client-list.component.css'
})
export class ClientListComponent implements OnInit{

  id: any;
  user!: UserResource[];
  avatar_file!:string;
  clients!: ClientResource[];
  client!: ClientResource;
  visible: boolean = false;

  constructor(
    private userEndpoint: UserService,
    private clientEnpoint: ClientsService,
    private readonly router: Router,
  ){

  }

  ngOnInit(): void {
    this.id=localStorage.getItem('id');
    this.getUser();
    this.getClient();
  }

  getSingleClients(id: any){
    this.clientEnpoint.getClient(id).subscribe({
      next:(response: any)=>{
        this.client = response.client;
        this.visible = true;
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
  getClient(){
    this.clientEnpoint.get().subscribe({
      next: (response: any)=>{
        this.clients = response.client
        this.avatar_file = environment.apiUrl + '/file/get/';        

      }
    });
   }

}

