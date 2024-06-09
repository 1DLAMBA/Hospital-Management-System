import { Component, OnInit } from '@angular/core';
import { UserService } from '../../../../endpoints/user.service';
import { UserResource } from '../../../../../resources/user.model';
import { AppointmentsService } from '../../../../endpoints/appointments.service';
import { DoctorsService } from '../../../../endpoints/doctors.service';
import { DoctorResource } from '../../../../../resources/doctor.model';
import { AppointmentResource } from '../../../../../resources/appointment.model';
import { environment } from '../../../../../environments/environment';
import { Table } from 'primeng/table';
import { response } from 'express';

@Component({
  selector: 'app-doctor-appointment',
  templateUrl: './doctor-appointment.component.html',
  styleUrl: './doctor-appointment.component.css'
})
export class DoctorAppointmentComponent implements OnInit {
  apptDetails: boolean= false;
  id: any;
  user!: any;
  appointment!: AppointmentResource[];
  avatar_file!: string;
  searchValue: string | undefined;
  singleAppt: any='';


  constructor(
    private userEndpoint: UserService,
    private doctorEndpoint: DoctorsService,
    private appointmentEndpoint: AppointmentsService,
  ) {

  }

  ngOnInit(): void {
    this.id = localStorage.getItem('id')

    this.getUser();
  }
  getUser() {
    this.userEndpoint.get(this.id).subscribe({
      next: (response: any) => {
        this.user = response.user
        this.avatar_file = environment.apiUrl + '/file/get/';
        this.appointmentEndpoint.get(this.user.doctors.id, 'doctor').subscribe({
          next: (response: any) => {
            this.appointment = response.appointments
          }
        })

      }
    })
  }

  viewAppt(appt_id: any){
    this.appointmentEndpoint.getSingle(appt_id).subscribe({
      next: (response: any)=>{
        this.apptDetails = true;
        this.singleAppt= response.appointments;
      }
    })
  }

  clear(table: Table) {
    table.clear();
    this.searchValue = ''
}
}
