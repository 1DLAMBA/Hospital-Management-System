import { Component, OnInit } from '@angular/core';
import { AdminService } from '../../../../../endpoints/admin.service';
import { environment } from '../../../../../../environments/environment';

@Component({
  selector: 'app-admin-users-list',
  templateUrl: './admin-users-list.component.html',
  styleUrl: './admin-users-list.component.css'
})
export class AdminUsersListComponent implements OnInit {
  users: any[] = [];
  avatar_file!: string;
  loading: boolean = false;

  constructor(private adminService: AdminService) {}

  ngOnInit(): void {
    this.avatar_file = environment.apiUrl + '/file/get/';
    this.getUsers();
  }

  getUsers(): void {
    this.loading = true;
    // Backend endpoint (UserController@index) has no server-side pagination/search;
    // it returns the full user list, so filtering/paging is handled client-side by p-table.
    this.adminService.getAllUsers().subscribe({
      next: (response: any) => {
        this.users = response.users || [];
        this.loading = false;
      },
      error: () => {
        this.loading = false;
      }
    });
  }

  roleLabel(user: any): string {
    switch (user.user_type) {
      case 'other_professional':
        return 'Other Professional';
      case 'doctor':
        return 'Doctor';
      case 'nurse':
        return 'Nurse';
      case 'client':
        return 'Client';
      default:
        return user.user_type || 'Unknown';
    }
  }
}
