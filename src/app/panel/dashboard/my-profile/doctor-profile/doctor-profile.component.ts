import { Component, OnInit, inject } from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';
import { UserService } from '../../../../endpoints/user.service';
import { DoctorsService } from '../../../../endpoints/doctors.service';
import { OtherProfessionalsService } from '../../../../endpoints/other-professionals.service';
import { DoctorResource } from '../../../../../resources/doctor.model';
import { environment } from '../../../../../environments/environment';
import { FormControl, FormGroup, Validators } from '@angular/forms';
import { AppointmentsService } from '../../../../endpoints/appointments.service';
import { NgbCalendar, NgbDatepickerModule, NgbDateStruct } from '@ng-bootstrap/ng-bootstrap';
import { JsonPipe } from '@angular/common';
import moment from 'moment';
import { MessageService } from 'primeng/api';
import { ClientsService } from '../../../../endpoints/clients.service';
import { ClientResource } from '../../../../../resources/client.model';
import { AppointmentResource } from '../../../../../resources/appointment.model';
import { MedicalService } from '../../../../endpoints/medical.service';
import { AuthService } from '../../../../auth.service';




@Component({
  selector: 'app-doctor-profile',
  templateUrl: './doctor-profile.component.html',
  styleUrl: './doctor-profile.component.css'
})
export class DoctorProfileComponent implements OnInit {
  today = inject(NgbCalendar).getToday();
  id: string = this.route.snapshot.params['id'];
  singleDoctor!: ClientResource | any;
  singleOtherProfessional!: any;
  professionalType: 'doctor' | 'other_professional' = 'doctor';
  avatar_file!: string;
  date: Date[] | undefined;
  visible: boolean = false;
  availabilityGroup!: FormGroup;
  appointments!:AppointmentResource[] | any;
  user_id: any;
  formData: any;
  preview: boolean = false;
  user: any;
  appointment: boolean = true;
  medicalRecords!: any[];


  
  constructor(
    private route: ActivatedRoute,
    private userEndpoint: UserService,
    private readonly router: Router,
    private messageService: MessageService,
    private doctorEndpoint: DoctorsService,
    private otherProfessionalEndpoint: OtherProfessionalsService,
    private medicalEndpoint: MedicalService,
    private authService: AuthService,
  ) {
    this.availabilityGroup = new FormGroup({
      checked: new FormControl<boolean>(false)
    })
  }

  ngOnInit(): void {
    this.user_id = localStorage.getItem('id');
    // First get user to determine type, then load professional data
    this.getUser();
    
    // Subscribe to availability toggle changes
    this.availabilityGroup.get('checked')?.valueChanges.subscribe((checked: boolean) => {
      if (this.singleDoctor?.id && this.professionalType === 'doctor') {
        this.toggleAvailability(checked);
      }
      // Note: other_professionals don't have availability toggle
    });

  }

  successAlert(message: any) {

    this.messageService.add({ severity: 'success', detail: message });
  }
  dangerAlert(message: any) {

    this.messageService.add({ severity: 'success', detail: message });
  }

  getUser (){
    this.userEndpoint.get(this.user_id).subscribe({
      next: (response: any) => {
        this.user = response.user;
        
        this.avatar_file = environment.apiUrl + '/file/get/';
        
        // Determine professional type and load professional data
        if (this.user.user_type === 'doctor' && this.user.doctors?.id) {
          this.professionalType = 'doctor';
          this.getsingleDoctor(this.user.doctors.id);
          // Initialize availability toggle with current doctor availability from user
          if (this.user.doctors.availability !== undefined && this.user.doctors.availability !== null) {
            const availability = this.convertToBoolean(this.user.doctors.availability);
            this.availabilityGroup.patchValue({ checked: availability }, { emitEvent: false });
          }
        } else if (this.user.user_type === 'other_professional' && this.user.other_professionals?.id) {
          this.professionalType = 'other_professional';
          this.getsingleOtherProfessional(this.user.other_professionals.id);
        }
      }
    })
  }

  // Helper function to properly convert availability value to boolean
  private convertToBoolean(value: any): boolean {
    if (typeof value === 'boolean') {
      return value;
    }
    if (typeof value === 'string') {
      return value === '1' || value.toLowerCase() === 'true';
    }
    if (typeof value === 'number') {
      return value === 1;
    }
    return false;
  }

 


  showDialog() {
    this.visible = true;
  }
  
  getsingleDoctor(id: any) {
    this.doctorEndpoint.getSingle(id).subscribe({
      next: (response: any) => {
        this.singleDoctor = response.doctor;
        this.loadMedicalRecords(this.singleDoctor.id);

        this.appointments = this.singleDoctor.appointments;
        if (this.appointments && this.appointments.date_time) {
          const appointmentDate = new Date(this.appointments.date_time);
          const today = new Date();
          if(appointmentDate.getDate() < today.getDate()){
            this.appointment=false;
          }
        }
        console.log('APPOINTEMENTS', this.appointments);
        
        // Initialize availability toggle with current doctor availability
        if (this.singleDoctor?.availability !== undefined) {
          const availability = this.convertToBoolean(this.singleDoctor.availability);
          this.availabilityGroup.patchValue({ checked: availability }, { emitEvent: false });
        }
        
        this.avatar_file = environment.apiUrl + '/file/get/';
      }
    })
  }

  getsingleOtherProfessional(id: any) {
    this.otherProfessionalEndpoint.getSingle(id).subscribe({
      next: (response: any) => {
        this.singleOtherProfessional = response.other_professional;
        // Note: Medical records might not be applicable for other_professionals
        // this.loadMedicalRecords(this.singleOtherProfessional.id);
        
        this.avatar_file = environment.apiUrl + '/file/get/';
      },
      error: (error: any) => {
        console.error('Error loading other professional:', error);
      }
    })
  }

  openMedRecordView(record: any) {
    // this.selectedMedRecord = record;
    // this.viewMedRecordDialog = true;
  }

  private loadMedicalRecords(id: any): void {
    console.log('USER', this.user);
    this.medicalEndpoint.getDoc(id).subscribe({
      next: (response: any) => {
        this.medicalRecords = response.record;
        console.table(this.medicalRecords);
        // this.loadingFlags.medicalRecords = true;
        // this.checkLoadingComplete();
      },
      error: (error: any) => {
        this.dangerAlert('Failed to get medical record');
        // this.loadingFlags.medicalRecords = true;
        // this.checkLoadingComplete();
      }
    });
  }

  toggleAvailability(availability: boolean) {
    if (!this.singleDoctor?.id) {
      return;
    }
    
    this.doctorEndpoint.toggleAvailability(this.singleDoctor.id, availability).subscribe({
      next: (response: any) => {
        this.successAlert(response.message || 'Availability updated successfully');
        // Update local doctor data
        if (response.doctor) {
          this.singleDoctor.availability = response.doctor.availability;
          // Also update user.doctors.availability if it exists
          if (this.user?.doctors) {
            this.user.doctors.availability = response.doctor.availability;
          }
        }
      },
      error: (error: any) => {
        this.dangerAlert('Failed to update availability');
        // Revert the toggle on error
        this.availabilityGroup.patchValue({ checked: !availability }, { emitEvent: false });
      }
    });
  }

  back() {
    // this.visible = false;
    this.preview = false;

  }

  logout() {
    // Call auth service logout (which clears localStorage)
    this.authService.logout();
    // Clear all localStorage (including id)
    localStorage.clear();
    // Navigate to login page
    this.router.navigate(['/login']);
  }

}

