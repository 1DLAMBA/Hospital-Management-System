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
  clients: ClientResource[] = [];
  client!: ClientResource;
  visible: boolean = false;
  
  // Pagination and search properties
  searchValue: string = '';
  totalRecords: number = 0;
  currentPage: number = 1;
  rowsPerPage: number = 10;
  loading: boolean = false;

  constructor(
    private userEndpoint: UserService,
    private clientEnpoint: ClientsService,
    private readonly router: Router,
  ){

  }

  ngOnInit(): void {
    this.id=localStorage.getItem('id');
    this.getUser();
    this.avatar_file = environment.apiUrl + '/file/get/';
    // Load initial data
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
  
  getClient(search?: string, page: number = 1, perPage: number = 10){
    this.loading = true;
    this.clientEnpoint.get(search, page, perPage).subscribe({
      next: (response: any)=>{
        this.clients = response.client;
        if (response.pagination) {
          this.totalRecords = response.pagination.total;
          this.currentPage = response.pagination.current_page;
          this.rowsPerPage = response.pagination.per_page;
        }
        this.loading = false;
      },
      error: () => {
        this.loading = false;
      }
    });
  }

  onSearch(event: any) {
    const value = event.target?.value || '';
    this.searchValue = value;
    this.currentPage = 1; // Reset to first page on search
    this.getClient(this.searchValue, this.currentPage, this.rowsPerPage);
  }

  clearSearch() {
    this.searchValue = '';
    this.currentPage = 1;
    this.getClient('', this.currentPage, this.rowsPerPage);
  }

  onPageChange(event: any) {
    // PrimeNG lazy load event structure: { first, rows, sortField, sortOrder, filters, globalFilter }
    const page = Math.floor(event.first / event.rows) + 1;
    this.currentPage = page;
    this.rowsPerPage = event.rows;
    this.getClient(this.searchValue, this.currentPage, this.rowsPerPage);
  }

}

