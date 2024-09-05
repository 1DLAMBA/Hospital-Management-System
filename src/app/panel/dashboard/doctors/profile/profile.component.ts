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






@Component({
  selector: 'app-profile',
  templateUrl: './profile.component.html',
  styleUrl: './profile.component.css',

})
export class ProfileComponent implements OnInit {
  today = inject(NgbCalendar).getToday();
  id: string = this.route.snapshot.params['id'];
  SingleDoctor!: DoctorResource;
  avatar_file!: string;
  date: Date[] | undefined;
  visible: boolean = false;
  apptFormGroup!: FormGroup;
  user_id: any;
  formData: any;
  preview: boolean = false;
  user: any;
  appointment!: boolean;




  constructor(
    private route: ActivatedRoute,
    private userEndpoint: UserService,
    private doctorEndpoint: DoctorsService,
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
    this.getSingleDoctor(this.id);
    this.user_id = localStorage.getItem('id');
    this.getUser(this.user_id);

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
        const appointmentDate = new Date(this.user.clients.appointments.date_time);
        const today = new Date();
        // console.log(appointmentDate, today)
        if(appointmentDate < today || this.user.clients.appointments.status !='pending' ){
          this.appointment=false;
        }

        console.log('USER', response);
        
    // this.getClient(this.user.id);

        this.avatar_file = environment.apiUrl + '/file/get/';        
      }
    })
  }

 


  showDialog() {
    this.visible = true;
  }
  getSingleDoctor(id: any) {
    this.doctorEndpoint.getSingle(id).subscribe({
      next: (response: any) => {
        this.SingleDoctor = response.doctor;
        this.avatar_file = environment.apiUrl + '/file/get/';
        // this.router.navigate([`/doctors/profile/${this.SingleDoctor.id}`])
      }
    })
  }

  back() {
    // this.visible = false;
    this.preview = false;

  }

  proceed() {
    console.log('THE USER ID',this.user.id)
    
      this.formData = {
        symptoms: this.apptFormGroup.value.symptoms,
        date_time: moment(this.apptFormGroup.value.date).format('YYYY-MM-DD HH:mm'),
        status: 'pending',
        doctor_id: this.SingleDoctor.id,
        client_id: this.user.clients.id,
        // client_id:this.apptFormGroup.value.date,
      }
    
      this.appointmentEndppoint.create(this.formData).subscribe({
        next: (res: any) => {
          console.log(res);
          this.visible = false;
          this.successAlert('Appointment request sent')
  
        }
      })


  }

  submit() {


    
  }


}
