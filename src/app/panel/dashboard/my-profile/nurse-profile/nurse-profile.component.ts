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


@Component({
  selector: 'app-nurse-profile',
  templateUrl: './nurse-profile.component.html',
  styleUrl: './nurse-profile.component.css'
})
export class NurseProfileComponent  implements OnInit {
  today = inject(NgbCalendar).getToday();
  id: string = this.route.snapshot.params['id'];
  singleNurse!: NurseResource | any;
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


  
  constructor(
    private route: ActivatedRoute,
    private userEndpoint: UserService,
    private readonly router: Router,
    private messageService: MessageService,
    private nurseEndpoint: NursesService,
  ) {
    this.availabilityGroup = new FormGroup({
      checked: new FormControl<boolean>(true)
    })
  }

  ngOnInit(): void {
    this.getsingleNurse(this.id);
    // this.user_id = localStorage.getItem('id');
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
  getsingleNurse(id: any) {
    this.userEndpoint.get(id).subscribe({
      next:(response: any)=>{
        this.user = response.user;
        console.log('APPOINTEMENTS', this.singleNurse);

        this.nurseEndpoint.getSingle(this.user.nurses.id).subscribe({
          next: (response: any) => {
            this.singleNurse = response.nurse;
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

  back() {
    // this.visible = false;
    this.preview = false;

  }



}

