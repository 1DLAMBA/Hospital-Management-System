import { Component, OnInit, OnDestroy } from '@angular/core';
import { UserService } from '../../../../endpoints/user.service';
import { UserResource } from '../../../../../resources/user.model';
import { AppointmentsService } from '../../../../endpoints/appointments.service';
import { DoctorsService } from '../../../../endpoints/doctors.service';
import { OtherProfessionalsService } from '../../../../endpoints/other-professionals.service';
import { DoctorResource } from '../../../../../resources/doctor.model';
import { response } from 'express';
import { ActivatedRoute, Router, NavigationEnd } from '@angular/router';
import { AppointmentResource } from '../../../../../resources/appointment.model';
import moment from 'moment';
import { filter, Subscription } from 'rxjs';

@Component({
  selector: 'app-doctor-panel',
  templateUrl: './doctor-panel.component.html',
  styleUrls: ['./doctor-panel.component.css']
})
export class DoctorPanelComponent implements OnInit, OnDestroy {
  id!: any; // Ensure this is properly initialized
  user!: any;
  data: any;
  options: any;
  products!: any;
  date: Date[] | undefined;
  upc_appt: any[] = [];
  doctor!: DoctorResource;
  appointment: AppointmentResource[] = [];
  acceptedAppointment: AppointmentResource[] = [];
  pendingAppointment: number = 0;
  recentAppt!: any;
  complaint!: string;
  acceptedAppointmentNum: any;
  today!: Date;
  previousAppointment: AppointmentResource[] = [];
  ThisMonth: any;
  basicOptions: any;
  private routerSubscription: Subscription | undefined;
  private isDataLoaded = false;
  loading: boolean = true;

  constructor(
    private userEndpoint: UserService,
    private doctorEndpoint: DoctorsService,
    private otherProfessionalEndpoint: OtherProfessionalsService,
    private appointmentEndpoint: AppointmentsService,
    private router: Router,
    private route: ActivatedRoute
  ) {}
  
  ngOnInit(): void {
    this.loading = true;
    this.setupChartOptions();
    
    // Subscribe to route params changes
    this.routerSubscription = this.route.params.subscribe(params => {
      this.id = params['id'];
      if (this.id) {
        this.loadAllData();
      }
    });
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
    this.loading = true;
    if (!this.id) {
      console.error('No user ID found in route params');
      this.loading = false;
      return;
    }
    console.log('Loading user data with ID:', this.id);
    
    // Load user data first
    this.userEndpoint.get(this.id).subscribe({
      next: (response: any) => {
        console.log('User data loaded:', response);
        this.user = response.user;
        
        // Check if user is doctor or other_professional
        if (this.user.user_type === 'doctor') {
          // Load doctor data
          this.doctorEndpoint.getDocUser(this.id).subscribe({
            next: (docResponse: any) => {
              this.doctor = docResponse.doctor;
              
              // Load appointments
              if (this.user?.doctors?.id) {
                this.loadAppointments(this.user.doctors.id, 'doctor');
              } else {
                console.error('Doctor ID not available');
                this.loading = false;
              }
            },
            error: (err) => {
              console.error('Error loading doctor data', err);
              this.loading = false;
            }
          });
        } else if (this.user.user_type === 'other_professional') {
          // Load other professional data
          this.otherProfessionalEndpoint.getOtherProfessionalUser(this.id).subscribe({
            next: (opResponse: any) => {
              // Store other professional data in doctor property for compatibility
              this.doctor = opResponse.other_professional;
              
              // Load appointments
              if (this.user?.other_professionals?.id) {
                this.loadAppointments(this.user.other_professionals.id, 'other_professional');
              } else {
                console.error('Other Professional ID not available');
                this.loading = false;
              }
            },
            error: (err) => {
              console.error('Error loading other professional data', err);
              this.loading = false;
            }
          });
        } else {
          console.error('User type not supported:', this.user.user_type);
          this.loading = false;
        }
      },
      error: (err) => {
        console.error('Error loading user data', err);
        this.loading = false;
      }
    });
  }
  
  loadAppointments(professionalId: string, userType: string): void {
    this.appointmentEndpoint.get(professionalId, userType).subscribe({
      next: (response: any) => {
        console.log('Appointments loaded:', response);
        this.appointment = response.appointments;
        this.processAppointmentData();
        this.loading = false;
      },
      error: (err) => {
        console.error('Error loading appointment data', err);
        this.loading = false;
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
    if (this.id) {
      this.doctorEndpoint.getDocUser(this.id).subscribe({
        next: (response: any) => {
          console.log('Doctor data loaded:', response);
          this.doctor = response.doctor;
        },
        error: (err) => {
          console.error('Error loading doctor data', err);
        }
      });
    } else {
      console.error('Doctor ID is not available');
    }
  }

  getDocAppt() {
    // This method is now handled by loadAllData
    console.log('getDocAppt method called');
  }
}
