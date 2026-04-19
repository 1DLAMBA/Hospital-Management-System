import { Component, OnInit } from '@angular/core';
import { UserService } from '../../../endpoints/user.service';
import { UserResource } from '../../../../resources/user.model';
import { AppointmentsService } from '../../../endpoints/appointments.service';
import { DoctorsService } from '../../../endpoints/doctors.service';
import { DoctorResource } from '../../../../resources/doctor.model';
import { AppointmentResource } from '../../../../resources/appointment.model';
import { environment } from '../../../../environments/environment';
import { Table } from 'primeng/table';
import { AssignmentsService } from '../../../endpoints/assignments.service';
import { MessageService } from 'primeng/api';

@Component({
  selector: 'app-assignments',
  templateUrl: './assignments.component.html',
  styleUrl: './assignments.component.css',
  providers: [MessageService],
})
export class AssignmentsComponent implements OnInit {
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
  canRespondToConsultations = true;

  readonly registrationRequiredTooltip =
    'Complete your registration under My profile before you can view assignment details or mark tasks done or declined.';

  constructor(
    private userEndpoint: UserService,
    private doctorEndpoint: DoctorsService,
    private appointmentEndpoint: AssignmentsService,
    private messageService: MessageService,
  ) {}

  ngOnInit(): void {
    this.id = localStorage.getItem('id');
    this.getUser();
  }

  getUser() {
    this.userEndpoint.get(this.id).subscribe({
      next: (response: any) => {
        this.user = response.user;
        this.canRespondToConsultations = response.user?.registration_complete !== false;
        this.avatar_file = environment.apiUrl + '/file/get/';
        const professionalId = this.user.nurses?.id || this.user.other_professionals?.id;

        if (!professionalId) {
          return;
        }

        this.appointmentEndpoint.get(professionalId).subscribe({
          next: (response: any) => {
            this.appointment = response.assignment;
            this.pendingAppointment = this.appointment.filter((user: any) => user.status == 'pending').length;
            this.acceptedAppointment = this.appointment.filter((user: any) => user.status == 'done').length;
          },
        });
      },
    });
  }

  viewAppt(appt_id: any) {
    if (!this.canRespondToConsultations) {
      return;
    }
    this.appointmentEndpoint.getSingle(appt_id).subscribe({
      next: (response: any) => {
        this.singleAppt = response.assignment[0];
        this.apptDetails = true;
      },
    });
  }

  clear(table: Table) {
    table.clear();
    this.searchValue = '';
  }

  status(id: any, status: any) {
    this.btnDisable = true;
    if (status == 'done') {
      const formData = {
        status: 'done',
      };
      this.editStatus(id, formData);
      this.getUser();

      return;
    } else if (status == 'Declined') {
      const formData = {
        status: 'Declined',
      };
      this.editStatus(id, formData);
      this.getUser();

      return;
    } else {
      const formData = {
        status: 'pending',
      };
      this.editStatus(id, formData);
      this.getUser();

      return;
    }
  }

  editStatus(id: any, status: any) {
    this.appointmentEndpoint.edit(id, status).subscribe({
      next: () => {
        this.btnDisable = false;
      },
      error: (error) => {
        this.btnDisable = false;
        const msg = error?.error?.error || error?.error?.message || 'Could not update assignment';
        if (error?.status === 403) {
          this.messageService.add({ severity: 'warn', summary: 'Action blocked', detail: msg });
        } else {
          this.messageService.add({ severity: 'error', summary: 'Error', detail: msg });
        }
      },
    });
  }
}
