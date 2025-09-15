import { Component, OnInit, inject } from '@angular/core';
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
import { NursesService } from '../../../../endpoints/nurses.service';
import { NurseResource } from '../../../../../resources/nurse.model';
import { MedicalService } from '../../../../endpoints/medical.service';
import { AssignmentsService } from '../../../../endpoints/assignments.service';




@Component({
  selector: 'app-profile-nurse',
  templateUrl: './profile-nurse.component.html',
  styleUrl: './profile-nurse.component.css'
})
export class ProfileNurseComponent implements OnInit {
  today = inject(NgbCalendar).getToday();
  id: string = this.route.snapshot.params['id'];
  singleNurse!: NurseResource | any;
  avatar_file!: string;
  date: Date[] | undefined;
  visible: boolean = false;
  availabilityGroup!: FormGroup;
  appointments!: AppointmentResource[] | any;
  user_id: any;
  formData: any;
  preview: boolean = false;
  user: any;
  appointment: boolean = true;
  assignDialog: boolean = false;
  clients!: ClientResource[];
  singleClient!: any;
  disableAssignBtn: boolean = false;
  createAssignDiag: boolean = false;
  assignForm!: FormGroup;
  assignments!: any[];


  constructor(
    private route: ActivatedRoute,
    private userEndpoint: UserService,
    private readonly router: Router,
    private messageService: MessageService,
    private nurseEndpoint: NursesService,
    private clientEndpoint: ClientsService,
    private medicalEndpoint: MedicalService,
    private assignmentEndpoint: AssignmentsService
  ) {
    this.availabilityGroup = new FormGroup({
      checked: new FormControl<boolean>(true)
    })

    this.assignForm = new FormGroup({
      assignment_message: new FormControl('', Validators.required),
      // diagnosis: new FormControl('', Validators.required)
    })
  }

  ngOnInit(): void {
    this.getsingleNurse(this.id);
    this.user_id = localStorage.getItem('id');
    // this.getUser();


  }

  successAlert(message: any) {

    this.messageService.add({ severity: 'success', detail: message });
  }
  dangerAlert(message: any) {

    this.messageService.add({ severity: 'success', detail: message });
  }






  showDialog() {
    this.visible = true;
  }
  assign() {
    this.clientEndpoint.get().subscribe({
      next: (response: any) => {
        this.clients = response.client;
        this.assignDialog = true;
      }
    })

  }

  clientSelect(cilent_id: any) {
    this.disableAssignBtn = true;
    this.clientEndpoint.getClient(cilent_id).subscribe({
      next: (response: any) => {
        this.singleClient = response.client;
        this.assignDialog = false;
        this.disableAssignBtn = false;
        this.createAssignDiag = true;

      }
    })


  }

  createAssign() {
    console.log('medData', this.singleClient.user.id);
   
        const assignmentFormData = {
          assigned_doctor_id: this.user_id,
          assigned_nurse_id: this.singleNurse.id,
          assigned_client_id: this.singleClient.id,
          assignment_message: this.assignForm.value.assignment_message,
          status: 'pending',

        }
        
        this.assignmentEndpoint.create(assignmentFormData).subscribe({
          next: (response: any) => {
            console.log('assignment created', response);
            this.createAssignDiag=false;
    this.getAssignment(this.singleNurse.id);


          }
        })
     
  }

  getsingleNurse(id: any) {
    this.nurseEndpoint.getSingle(id).subscribe({
      next: (response: any) => {
        this.singleNurse = response.nurse;
    this.getAssignment(this.singleNurse.id);
        console.log('APPOINTEMENTS', this.singleNurse);
        this.userEndpoint.get(this.singleNurse.user_id).subscribe({
          next: (response: any) => {
            this.user = response.user;
          }
        })
        // this.appointments = this.singleNurse.appointments;
        // const appointmentDate = new Date(this.appointments.date_time);
        // const today = new Date();
        // if(appointmentDate.getDate() < today.getDate()){
        //   this.appointment=false;
        // }

        this.avatar_file = environment.apiUrl + '/file/get/';
        // this.router.navigate([`/doctors/profile/${this.SingleDoctor.id}`])
      }
    })
  }

  getAssignment(id: any){
    this.assignmentEndpoint.get(id).subscribe({
      next: (response: any)=>{
        this.assignments = response.assignment;
      }
    })
  }

  back() {
    // this.visible = false;
    this.preview = false;
  }

  navigateToChat(): void {
    if (this.user && this.user.id) {
      this.router.navigate(['/panel/dashboard/messages/chat'], { 
        queryParams: { 
          receiver_id: this.user.id,
          name: this.user.name,
          avatar: this.user.passport
        } 
      });
    } else {
      this.messageService.add({
        severity: 'error',
        summary: 'Error',
        detail: 'Unable to start chat. User information is not available.'
      });
    }
  }
}

