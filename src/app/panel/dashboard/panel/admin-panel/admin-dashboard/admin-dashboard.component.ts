import { Component, OnInit } from '@angular/core';
import { AdminService } from '../../../../../endpoints/admin.service';

@Component({
  selector: 'app-admin-dashboard',
  templateUrl: './admin-dashboard.component.html',
  styleUrl: './admin-dashboard.component.css'
})
export class AdminDashboardComponent implements OnInit {
  totalUsers: number = 0;
  totalHospitals: number = 0;
  pendingHospitals: number = 0;
  approvedHospitals: number = 0;
  rejectedHospitals: number = 0;
  loading: boolean = true;

  roleChartData: any;
  roleChartOptions: any;
  statusChartData: any;
  statusChartOptions: any;

  private usersLoaded = false;
  private hospitalsLoaded = false;

  constructor(private adminService: AdminService) {}

  ngOnInit(): void {
    this.setupChartOptions();

    this.adminService.getAllUsers().subscribe({
      next: (response: any) => {
        const users: any[] = response.users || [];
        this.totalUsers = users.length;
        this.buildRoleChart(users);
        this.usersLoaded = true;
        this.checkLoaded();
      },
      error: () => {
        this.usersLoaded = true;
        this.checkLoaded();
      }
    });

    this.adminService.getAllHospitals(undefined, 1, 1000).subscribe({
      next: (response: any) => {
        const hospitals: any[] = response.hospital || [];
        this.totalHospitals = response.pagination?.total ?? hospitals.length;
        this.pendingHospitals = hospitals.filter((h) => h.status === 'pending').length;
        this.approvedHospitals = hospitals.filter((h) => h.status === 'approved').length;
        this.rejectedHospitals = hospitals.filter((h) => h.status === 'rejected').length;
        this.buildStatusChart();
        this.hospitalsLoaded = true;
        this.checkLoaded();
      },
      error: () => {
        this.hospitalsLoaded = true;
        this.checkLoaded();
      }
    });
  }

  private checkLoaded(): void {
    if (this.usersLoaded && this.hospitalsLoaded) {
      this.loading = false;
    }
  }

  private buildRoleChart(users: any[]): void {
    const roleLabels: Record<string, string> = {
      doctor: 'Doctors',
      nurse: 'Nurses',
      other_professional: 'Other Professionals',
      client: 'Clients',
    };
    const counts: Record<string, number> = { doctor: 0, nurse: 0, other_professional: 0, client: 0 };
    users.forEach((u) => {
      if (counts[u.user_type] !== undefined) {
        counts[u.user_type]++;
      }
    });

    this.roleChartData = {
      labels: Object.values(roleLabels),
      datasets: [
        {
          label: 'Users',
          backgroundColor: '#0055AA',
          hoverBackgroundColor: '#17224D',
          borderRadius: 4,
          maxBarThickness: 56,
          data: Object.keys(roleLabels).map((key) => counts[key]),
        },
      ],
    };
  }

  private buildStatusChart(): void {
    this.statusChartData = {
      labels: ['Approved', 'Pending', 'Rejected'],
      datasets: [
        {
          data: [this.approvedHospitals, this.pendingHospitals, this.rejectedHospitals],
          // Vital / ember / critical — the same three states the status pills use.
          backgroundColor: ['#0F766E', '#B45309', '#9F1239'],
          borderWidth: 0,
          hoverOffset: 6,
        },
      ],
    };
  }

  private setupChartOptions(): void {
    const tick = { color: '#737c9e', font: { family: 'IBM Plex Sans', size: 12 } };

    this.roleChartOptions = {
      maintainAspectRatio: false,
      plugins: { legend: { display: false } },
      scales: {
        x: { ticks: tick, grid: { display: false }, border: { color: '#e3e8f0' } },
        y: {
          beginAtZero: true,
          ticks: { ...tick, stepSize: 1, precision: 0 },
          grid: { color: '#eef1f6' },
          border: { display: false },
        },
      },
    };

    this.statusChartOptions = {
      maintainAspectRatio: false,
      cutout: '62%',
      plugins: {
        legend: {
          position: 'bottom',
          labels: {
            color: '#46507a',
            usePointStyle: true,
            pointStyle: 'circle',
            boxWidth: 8,
            padding: 16,
            font: { family: 'IBM Plex Sans', size: 12 },
          },
        },
      },
    };
  }
}
