import { Component, OnInit, inject } from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';
import { UserService } from '../../../../endpoints/user.service';
import { DoctorsService } from '../../../../endpoints/doctors.service';
import { OtherProfessionalsService } from '../../../../endpoints/other-professionals.service';
import { DoctorResource } from '../../../../../resources/doctor.model';
import { OtherProfessionalResource } from '../../../../../resources/other-professional.model';
import { environment } from '../../../../../environments/environment';
import { FormControl, FormGroup, Validators } from '@angular/forms';
import { AppointmentsService } from '../../../../endpoints/appointments.service';
import { NgbCalendar, NgbDatepickerModule, NgbDateStruct } from '@ng-bootstrap/ng-bootstrap';
import { JsonPipe } from '@angular/common';
import moment from 'moment';
import { MessageService } from 'primeng/api';
import { ClientsService } from '../../../../endpoints/clients.service';






@Component({
  selector: 'app-profile',
  templateUrl: './profile.component.html',
  styleUrl: './profile.component.css',

})
export class ProfileComponent implements OnInit {
  today = inject(NgbCalendar).getToday();
  id: string = this.route.snapshot.params['id'];
  professionalType: 'doctor' | 'other_professional' = 'doctor'; // Default to doctor
  SingleDoctor!: DoctorResource;
  singleOtherProfessional!: OtherProfessionalResource;
  professional: any; // Unified professional object
  avatar_file!: string;
  date: Date[] | undefined;
  visible: boolean = false;
  apptFormGroup!: FormGroup;
  user_id: any;
  formData: any;
  preview: boolean = false;
  user: any;
  appointment!: boolean;
  loading: boolean = false;
  minDate: Date = new Date();




  constructor(
    private route: ActivatedRoute,
    private userEndpoint: UserService,
    private doctorEndpoint: DoctorsService,
    private otherProfessionalEndpoint: OtherProfessionalsService,
    private readonly router: Router,
    private appointmentEndppoint: AppointmentsService,
    private messageService: MessageService,
    private clientEndpoint: ClientsService,
  ) {
    this.apptFormGroup = new FormGroup({
      symptoms: new FormControl('', Validators.required),
      date: new FormControl('', Validators.required)
    })
  }

  ngOnInit(): void {
    // Check if this is a doctor or other_professional based on route query params
    this.user_id = localStorage.getItem('id');
    this.getUser(this.user_id);
    
    // Get the type from query params, default to trying both if not provided
    const type = this.route.snapshot.queryParams['type'];
    if (type === 'other_professional') {
      this.professionalType = 'other_professional';
      this.getSingleOtherProfessional(this.id);
    } else if (type === 'doctor') {
      this.professionalType = 'doctor';
      this.getSingleDoctor(this.id);
    } else {
      // If no type specified, try doctor first, then other_professional
      this.getSingleDoctor(this.id);
    }
}

  successAlert(message: any) {

    this.messageService.add({ severity: 'success', detail: message });
  }
  dangerAlert(message: any) {

    this.messageService.add({ severity: 'success', detail: message });
  }

  getUser (id: any){
    this.userEndpoint.get(id).subscribe({
      next: (response: any) => {
        this.user = response.user;
        
        // Check if user has clients and appointments
        if (this.user.clients?.appointments) {
          const appointmentDate = new Date(this.user.clients.appointments.date_time);
          const today = new Date();
          if(appointmentDate < today || this.user.clients.appointments.status !='pending' ){
            this.appointment=false;
          }
        } else {
          // If no existing appointment, allow booking
          this.appointment = true;
        }

        console.log('USER', response);
        
        this.avatar_file = environment.apiUrl + '/file/get/';        
      }
    })
  }

 


  showDialog() {
    this.visible = true;
  }
  getSingleDoctor(id: any) {
    // Get doctor by ID
    this.doctorEndpoint.getSingle(id).subscribe({
      next: (response: any) => {
        this.SingleDoctor = response.doctor;
        this.professional = { ...response.doctor, type: 'doctor', displayType: 'Doctor' };
        this.professionalType = 'doctor';
        this.avatar_file = environment.apiUrl + '/file/get/';
      },
      error: (err) => {
        // If not found as doctor and no type was specified, try as other_professional
        if (!this.route.snapshot.queryParams['type']) {
          this.getSingleOtherProfessional(id);
        } else {
          console.error('Doctor not found:', err);
        }
      }
    })
  }

  getSingleOtherProfessional(id: any) {
    // Get other professional by ID
    this.otherProfessionalEndpoint.getSingle(id).subscribe({
      next: (response: any) => {
        this.singleOtherProfessional = response.other_professional;
        this.professional = { 
          ...response.other_professional, 
          type: 'other_professional', 
          displayType: response.other_professional.professional_type 
        };
        this.professionalType = 'other_professional';
        this.avatar_file = environment.apiUrl + '/file/get/';
      },
      error: (error) => {
        console.error('Other Professional not found:', error);
      }
    });
  }

  back() {
    // this.visible = false;
    this.preview = false;

  }

  proceed() {
    console.log('THE USER ID',this.user.id)
    this.loading = true;
    
    // Ensure user has clients before creating appointment
    if (!this.user?.clients?.id) {
      this.loading = false;
      this.dangerAlert('Client information not found');
      return;
    }
    
    // Create appointment data based on professional type
    this.formData = {
      symptoms: this.apptFormGroup.value.symptoms,
      date_time: moment(this.apptFormGroup.value.date).format('YYYY-MM-DD HH:mm'),
      status: 'pending',
      doctor_id: this.professionalType === 'doctor' ? this.professional.id : null,
      other_professional_id: this.professionalType === 'other_professional' ? this.professional.id : null,
      client_id: this.user.clients.id,
    }
  
    this.appointmentEndppoint.create(this.formData).subscribe({
      next: (res: any) => {
        console.log(res);
        this.loading = false;
        this.visible = false;
        this.successAlert('Appointment request sent');
        // Refresh user data to get updated appointment information
        this.getUser(this.user_id);
      },
      error: (err: any) => {
        this.loading = false;
        this.dangerAlert('Failed to create appointment');
      }
    })
  }

  submit() {


    
  }


}
