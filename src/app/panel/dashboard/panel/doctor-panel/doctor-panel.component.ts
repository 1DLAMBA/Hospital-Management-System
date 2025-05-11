import { Component, OnInit, OnDestroy } from '@angular/core';
import { UserService } from '../../../../endpoints/user.service';
import { UserResource } from '../../../../../resources/user.model';
import { AppointmentsService } from '../../../../endpoints/appointments.service';
import { DoctorsService } from '../../../../endpoints/doctors.service';
import { DoctorResource } from '../../../../../resources/doctor.model';
import { response } from 'express';
import { ActivatedRoute, Router, NavigationEnd } from '@angular/router';
import { AppointmentResource } from '../../../../../resources/appointment.model';
import moment from 'moment';
import { filter, Subscription } from 'rxjs';


@Component({
  selector: 'app-doctor-panel',
  templateUrl: './doctor-panel.component.html',
  styleUrl: './doctor-panel.component.css'
})
export class DoctorPanelComponent implements OnInit, OnDestroy {
  id: any;
  user!: any;
  data: any;
  options: any;
  products!: any;
  date: Date[] | undefined;
  upc_appt!: any[];
  doctor!: DoctorResource;
  appointment: AppointmentResource[] | any;
  acceptedAppointment!: AppointmentResource[];
  pendingAppointment!: number;
  recentAppt!: any;
  complaint!: string;
  acceptedAppointmentNum: any;
  today!: Date;
  previousAppointment!: AppointmentResource[];
  ThisMonth: any;
  basicOptions: any;
  private routerSubscription: Subscription | undefined;
  private isDataLoaded = false;

  constructor(
    private userEndpoint: UserService,
    private doctorEndpoint: DoctorsService,
    private appointmentEndpoint: AppointmentsService,
    private router: Router,
    private route: ActivatedRoute
  ) {
    // This constructor approach ensures the component reloads data when navigated to
    this.routerSubscription = this.router.events
      .pipe(filter(event => event instanceof NavigationEnd))
      .subscribe(() => {
        // Force reload data whenever this component becomes active
        console.log('NavigationEnd event triggered');
        if (this.router.url.includes('/panel/doctor')) {
          console.log('Loading data from router event');
          this.loadAllData();
        }
      });
  }
  
  ngOnInit(): void {
    console.log('Doctor panel ngOnInit');
    this.setupChartOptions();
    // Initial data load
    this.loadAllData();
  }
  
  ngOnDestroy(): void {
    // Clean up subscription when component is destroyed
    if (this.routerSubscription) {
      this.routerSubscription.unsubscribe();
    }
  }

  // Single method to load all data in the correct sequence
  loadAllData(): void {
    console.log('Starting data load sequence');
    this.id = localStorage.getItem('id');
    if (!this.id) {
      console.error('No user ID found in localStorage');
      return;
    }
    console.log('Loading user data with ID:', this.id);
    
    // Load user data first
    this.userEndpoint.get(this.id).subscribe({
      next: (response: any) => {
        console.log('User data loaded:', response);
        this.user = response.user;
        
        // Then load doctor data
        this.getDocUser();
        
        // Then load appointments if doctor ID is available
        if (this.user && this.user.doctors && this.user.doctors.id) {
          console.log('Loading appointments for doctor ID:', this.user.doctors.id);
          this.loadAppointments(this.user.doctors.id);
        } else {
          console.error('Doctor ID not available', this.user);
        }
      },
      error: (err) => {
        console.error('Error loading user data', err);
      }
    });
  }
  
  loadAppointments(doctorId: string): void {
    this.appointmentEndpoint.get(doctorId, 'doctor').subscribe({
      next: (response: any) => {
        console.log('Appointments loaded:', response);
        this.appointment = response.appointments;
        this.processAppointmentData();
      },
      error: (err) => {
        console.error('Error loading appointment data', err);
      }
    });
  }
  
  processAppointmentData(): void {
    if (!this.appointment || this.appointment.length === 0) {
      console.log('No appointments available');
      return;
    }
    
    // Process the monthly data for charts
    const getMonthCount = (month: string, status: string) => {
      return Number(this.appointment.filter((appointment: any) => {
        const apptMonth = moment(appointment.date_time).format('MM');
        return appointment.status === status && apptMonth === month;
      }).length);
    };
    
    const months = ['01', '02', '03', '04', '05', '06', '07', '08', '09', '10', '11', '12'];
    const acceptedData = months.map(month => getMonthCount(month, 'Accepted'));
    const pendingData = months.map(month => getMonthCount(month, 'pending'));
    
    this.data = {
      labels: ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'],
      datasets: [
        {
          label: 'Accepted',
          backgroundColor: '#0055aa',
          borderColor: '#0055aa',
          data: acceptedData
        },
        {
          label: 'Ignored',
          backgroundColor: '#7A8AB5',
          borderColor: '#7A8AB5',
          data: pendingData
        }
      ]
    };
    
    // Calculate other appointment stats
    this.acceptedAppointment = this.appointment.filter((user: any) => user.status == 'Accepted');
    this.acceptedAppointmentNum = this.acceptedAppointment.length;
    
    // Calculate past and upcoming appointments
    const today = new Date();
    this.previousAppointment = this.acceptedAppointment.filter((user: any) => {
      const appointmentDate = new Date(user.date_time);
      return appointmentDate < today;
    });
    
    this.upc_appt = this.acceptedAppointment.filter((user: any) => {
      const appointmentDate = new Date(user.date_time);
      return appointmentDate > today;
    });
    
    // Get most recent appointment
    if (this.acceptedAppointment.length > 0) {
      this.recentAppt = this.acceptedAppointment[0];
      this.complaint = this.splitComplaint(this.recentAppt.symptoms);
    }
    
    // Calculate pending appointments
    this.pendingAppointment = this.appointment.filter((user: any) => user.status == 'pending').length;
  }
  
  setupChartOptions(): void {
    const documentStyle = getComputedStyle(document.documentElement);
    
    this.options = {
      maintainAspectRatio: false,
      aspectRatio: 0.8,
      plugins: {
        legend: {
          labels: {
            color: 'white'
          }
        }
      },
      scales: {
        x: {
          ticks: {
            color: 'white',
            font: {
              weight: 500
            }
          },
          grid: {
            color: '#31385261',
            drawBorder: false
          }
        },
        y: {
          beginAtZero: true,
          ticks: {
            stepSize: 1,
            precision: 0,
            color: 'white'
          },
          grid: {
            color: '#31385261',
            drawBorder: false
          }
        }
      }
    };
    
    this.products = [
      {
        name: 'John Doe',
        serial: '1',
        category: 'gyan',
        patient: 'good'
      },
      {
        name: 'Samuel Larry',
        serial: '2',
        category: 'gyan',
        patient: 'good'
      },
      {
        name: 'Gideon Oj',
        serial: '3',
        category: 'Dark',
        patient: 'good'
      },
    ];
  }

  splitComplaint(complaint: string) {
    const words = complaint.split(' ');
    return words.slice(0, 2).join(' ');
  }

  getDocUser() {
    console.log('Loading doctor user data');
    this.doctorEndpoint.getDocUser(this.id).subscribe({
      next: (response: any) => {
        console.log('Doctor data loaded:', response);
        this.doctor = response.doctor;
      },
      error: (err) => {
        console.error('Error loading doctor data', err);
      }
    });
  }

  getDocAppt() {
    // This method is now handled by loadAllData
    console.log('getDocAppt method called');
  }
}
