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
  apptDetails: boolean = false;
  id: any;
  user!: any;
  appointment!: AppointmentResource[];
  avatar_file!: string;
  searchValue: string | undefined;
  singleAppt: any = '';
  pendingAppointment: any;
  acceptedAppointment: any;
  declinedAppointment: any;
  btnDisable: boolean = false;


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
            this.appointment = response.appointments;
            this.pendingAppointment = this.appointment.filter((user: any) => user.status=='pending').length;
            this.acceptedAppointment = this.appointment.filter((user: any) => user.status=='Accepted').length;
            this.declinedAppointment = this.appointment.filter((user: any) => user.status=='Declined').length;
          }
        })

      }
    })
  }

  viewAppt(appt_id: any) {
    this.appointmentEndpoint.getSingle(appt_id).subscribe({
      next: (response: any) => {
        this.apptDetails = true;
        this.singleAppt = response.appointments;
      }
    })
  }

  clear(table: Table) {
    table.clear();
    this.searchValue = ''
  }

  status(id: any, status: any) {
    this.btnDisable=true;
    if (status == 'Accepted') {
      const formData = {
        status: 'Accepted'
      }
      this.editStatus(id, formData);
      this.getUser();

      return;
    } else if (status == 'Declined') {
      const formData = {
        status: 'Declined'
      }
      this.editStatus(id, formData);
      this.getUser();

      return;
    } else {
      const formData = {
        status: 'pending'
      }
      this.editStatus(id, formData);
      this.getUser();

      return;

    }
  }

  editStatus(id: any, status: any) {

    this.appointmentEndpoint.edit(id, status).subscribe({
      next: (response: any) => {
        // this.apptDetails = false;
        this.viewAppt(id);
        this.btnDisable=false;

      }
    })
  }
}
