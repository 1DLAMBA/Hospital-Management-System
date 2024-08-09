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


  
  constructor(
    private route: ActivatedRoute,
    private userEndpoint: UserService,
    private readonly router: Router,
    private messageService: MessageService,
    private clientEndpoint: ClientsService,
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

  getUser (){
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
 
  back() {
    // this.visible = false;
    this.preview = false;

  }

 
 

}

