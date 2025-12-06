import { Component , OnInit, inject } from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';
import { UserService } from '../../../../endpoints/user.service';
import { DoctorsService } from '../../../../endpoints/doctors.service';
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
  selector: 'app-profile-page',
  templateUrl: './profile-page.component.html',
  styleUrl: './profile-page.component.css'
})
export class ProfilePageComponent implements OnInit {
  today = inject(NgbCalendar).getToday();
  id: string = this.route.snapshot.params['id'];
  singleClient!: ClientResource | any;
  avatar_file!: string;
  date: Date[] | undefined;
  visible: boolean = false;
  apptFormGroup!: FormGroup;
  appointments!:AppointmentResource[] | any;
  user_id: any;
  formData: any;
  preview: boolean = false;
  user: any;
  appointment: boolean = true;
  medicalRecords!: any[];
  viewMedRecordDialog: boolean = false;
  selectedMedRecord: any = null;
  defaultAvatar = 'assets/images/default-avatar.png';

  handleImageError(event: Event) {
    const img = event.target as HTMLImageElement;
    img.src = this.defaultAvatar;
    img.onerror = null; // Prevent infinite loop if default image fails
  }
  
  constructor(
    private route: ActivatedRoute,
    private userEndpoint: UserService,
    private readonly router: Router,
    private messageService: MessageService,
    private clientEndpoint: ClientsService,
    private medicalEndpoint: MedicalService,
    private authService: AuthService
  ) {
    this.apptFormGroup = new FormGroup({
      symptoms: new FormControl('', Validators.required),
      date: new FormControl('', Validators.required)
    })
  }

  ngOnInit(): void {
    // this.getSingleClient(this.id);
    this.user_id = localStorage.getItem('id');
    this.getUser();

  }

  successAlert(message: any) {

    this.messageService.add({ severity: 'success', detail: message });
  }
  dangerAlert(message: any) {

    this.messageService.add({ severity: 'success', detail: message });
  }

  getClientRecord(){
    this.medicalEndpoint.getClient(this.user.clients.id).subscribe({
      next: (response: any) => {
        this.medicalRecords = response.record;
        console.table(this.medicalRecords)
        
    // this.getClient(this.user.id);

      },
      error:(error:any)=>{
        this.dangerAlert('Failed to get medical record');
      }})
  }

  getUser (){
    this.userEndpoint.get(this.user_id).subscribe({
      next: (response: any) => {
        this.user = response.user;
    this.getClientRecord();
        
    // this.getClient(this.user.id);

        this.avatar_file = environment.apiUrl + '/file/get/';        
      }
    })
  }

  openMedRecordView(record: any) {
    this.selectedMedRecord = record;
    this.viewMedRecordDialog = true;
  }


  showDialog() {
    this.visible = true;
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

