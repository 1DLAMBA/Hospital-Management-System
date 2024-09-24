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
import { MedicalService } from '../../../../endpoints/medical.service';
import { NursesService } from '../../../../endpoints/nurses.service';
import { AssignmentsService } from '../../../../endpoints/assignments.service';
import { NurseResource } from '../../../../../resources/nurse.model';
import { ChatDialogService } from '../../../chat-dialog.service';
import { MessagesService } from '../../../../endpoints/messages.service';
import { error } from 'node:console';






@Component({
  selector: 'app-client-profile',
  templateUrl: './client-profile.component.html',
  styleUrl: './client-profile.component.css'
})
export class ClientProfileComponent implements OnInit {
  today = inject(NgbCalendar).getToday();
  id: string = this.route.snapshot.params['id'];
  singleClient!: ClientResource | any;
  singleNurse!: NurseResource | any;

  avatar_file!: string;
  date: Date[] | undefined;
  visible: boolean = false;
  apptFormGroup!: FormGroup;
  appointments!: AppointmentResource[] | any;
  user_id: any;
  formData: any;
  preview: boolean = false;
  user: any;
  appointment: boolean = true;
  assignDialog: boolean = false;
  clients!: ClientResource[];
  nurses!: NurseResource[];
  disableAssignBtn: boolean = false;
  createAssignDiag: boolean = false;
  assignForm!: FormGroup;
  assignments!: any[];
  visibleMsg: boolean = false;

  position: string = 'center';

  messages: any = [
    { from: 'user', text: 'Hi there! How are you?', time: '10:00 AM' },
    { from: 'bot', text: 'Hello! I am good, how can I help you?', time: '10:01 AM' },
  ];
  newMessage: string = '';



  constructor(
    private route: ActivatedRoute,
    private userEndpoint: UserService,
    private readonly router: Router,
    private messageService: MessageService,
    private nurseEndpoint: NursesService,
    private clientEndpoint: ClientsService,
    private medicalEndpoint: MedicalService,
    private assignmentEndpoint: AssignmentsService,
    private chatDialogService: ChatDialogService,
    private MessagesEnpoint: MessagesService
  ) {
    this.assignForm = new FormGroup({
      assignment_message: new FormControl('', Validators.required),
      // diagnosis: new FormControl('', Validators.required)
    })
  }

  ngOnInit(): void {
    this.getSingleClient(this.id);
    this.user_id = localStorage.getItem('id');
    this.getUser();

  }
  openChat() {
    this.chatDialogService.openChat('sender123', 'receiver456');
  }

  successAlert(message: any) {

    this.messageService.add({ severity: 'success', detail: message });
  }
  dangerAlert(message: any) {

    this.messageService.add({ severity: 'success', detail: message });
  }

  showMsgDialog(position: string) {
    this.position = position;
    this.visibleMsg = true;
    console.log('reached');

  }
  sendMessage() {
    if (this.newMessage.trim()) {
      this.messages.push({
        from: this.user_id,
        text: this.newMessage,
        time: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
      });
      const formData = {
        sender_id: this.user_id,
        receiver_id: this.singleClient.user_id,
        message: this.newMessage
      }
      this.MessagesEnpoint.sendMessage(formData).subscribe({
        next: (response: any) => {
          console.log(response);
        },error:(error: any)=>{
          console.log(error)
        }
      })

      this.newMessage = '';
    }
  }

  assign() {
    this.nurseEndpoint.get().subscribe({
      next: (response: any) => {
        this.nurses = response.nurse;
        this.assignDialog = true;
      }
    })

  }

  nurseSelect(nurse_id: any) {
    this.disableAssignBtn = true;
    this.nurseEndpoint.getSingle(nurse_id).subscribe({
      next: (response: any) => {
        this.singleNurse = response.nurse;
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
        this.createAssignDiag = false;
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

  getAssignment(id: any) {
    this.assignmentEndpoint.get(id).subscribe({
      next: (response: any) => {
        this.assignments = response.assignment;
      }
    })
  }

  getUser() {
    this.userEndpoint.get(this.user_id).subscribe({
      next: (response: any) => {
        this.user = response.user;

        // this.getClient(this.user.id);

        this.avatar_file = environment.apiUrl + '/file/get/';
      }
    })
  }




  showDialog() {
    this.visible = true;
  }
  getSingleClient(id: any) {
    this.clientEndpoint.getClient(id).subscribe({
      next: (response: any) => {
        this.singleClient = response.client;
        this.appointments = this.singleClient.appointments;
        const appointmentDate = new Date(this.appointments.date_time);
        const today = new Date();
        if (appointmentDate.getDate() < today.getDate()) {
          this.appointment = false;
        }
        console.log('APPOINTEMENTS', this.appointments);

        this.avatar_file = environment.apiUrl + '/file/get/';
        // this.router.navigate([`/doctors/profile/${this.SingleDoctor.id}`])
      }
    })
  }

  back() {
    // this.visible = false;
    this.preview = false;

  }




}

