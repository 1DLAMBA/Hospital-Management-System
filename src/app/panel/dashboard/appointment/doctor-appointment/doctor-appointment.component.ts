import { Component, OnInit } from '@angular/core';
import { Router } from '@angular/router';
import { UserService } from '../../../../endpoints/user.service';
import { UserResource } from '../../../../../resources/user.model';
import { AppointmentsService } from '../../../../endpoints/appointments.service';
import { DoctorsService } from '../../../../endpoints/doctors.service';
import { DoctorResource } from '../../../../../resources/doctor.model';
import { AppointmentResource } from '../../../../../resources/appointment.model';
import { environment } from '../../../../../environments/environment';
import { Table } from 'primeng/table';
import { MessageService } from 'primeng/api';

@Component({
  selector: 'app-doctor-appointment',
  templateUrl: './doctor-appointment.component.html',
  styleUrl: './doctor-appointment.component.css',
  providers: [MessageService],
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
  loading: boolean = true;
  acceptLoading: boolean = false;
  canRespondToConsultations = true;

  /** Shown when View is disabled for incomplete registration */
  readonly registrationRequiredTooltip =
    'Complete your registration under My profile before you can view appointment details or accept requests.';

  readonly chatDisabledTooltip = 'Chat is available after the appointment is accepted.';

  constructor(
    private userEndpoint: UserService,
    private doctorEndpoint: DoctorsService,
    private appointmentEndpoint: AppointmentsService,
    private messageService: MessageService,
    private router: Router,
  ) {

  }

  ngOnInit(): void {
    this.id = localStorage.getItem('id');
    this.loadData();
  }

  loadData(): void {
    this.loading = true;
    this.getUser();
  }
  getUser() {
    this.userEndpoint.get(this.id).subscribe({
      next: (response: any) => {
        this.user = response.user;
        this.canRespondToConsultations = response.user?.registration_complete !== false;
        this.avatar_file = environment.apiUrl + '/file/get/';
        this.loadAppointments();
      },
      error: (error) => {
        console.error('Error fetching user:', error);
        this.loading = false;
      }
    });
  }

  loadAppointments(): void {
    // Handle both doctors and other_professionals
    const professionalId = this.user.doctors?.id || this.user.other_professionals?.id || this.user.nurses?.id;
    const userType = this.user.doctors ? 'doctor' : (this.user.other_professionals ? 'other_professional' : 'nurse');
    
    if (!professionalId) {
      console.error('No professional ID found');
      this.loading = false;
      return;
    }
    
    this.appointmentEndpoint.get(professionalId + '?_=' + new Date().getTime(), userType).subscribe({
      next: (response: any) => {
        this.appointment = response.appointments;
        this.updateAppointmentCounts();
        this.loading = false;
      },
      error: (error) => {
        console.error('Error loading appointments:', error);
        this.loading = false;
      }
    });
  }

  viewAppt(id: any) {
    if (!this.canRespondToConsultations) {
      return;
    }
    this.appointmentEndpoint.getSingle(id).subscribe({
      next: (response: any) => {
        this.apptDetails = true;
        this.singleAppt = this.appointment.find((appt: any) => appt.id === id);
      }
    });
  }

  updateAppointmentCounts(): void {
    this.pendingAppointment = this.appointment.filter(appt => appt.status === 'pending').length;
    this.acceptedAppointment = this.appointment.filter(appt => appt.status === 'Accepted').length;
    this.declinedAppointment = this.appointment.filter(appt => appt.status === 'Declined').length;
  }

  getClientUserIdForChat(appt: any): number | null {
    const raw = appt?.client?.user?.id;
    if (raw === null || raw === undefined) {
      return null;
    }
    const n = Number(raw);
    return Number.isFinite(n) ? n : null;
  }

  isAppointmentChatEnabled(appt: any): boolean {
    return appt?.status === 'Accepted' && this.getClientUserIdForChat(appt) != null;
  }

  openAppointmentChat(appt: any): void {
    if (!this.isAppointmentChatEnabled(appt)) {
      return;
    }
    const uid = this.getClientUserIdForChat(appt)!;
    const u = appt.client?.user;
    this.router.navigate([`/panel/messages/${uid}`], {
      queryParams: {
        name: u?.name ?? undefined,
        dp: u?.passport ?? undefined,
        email: u?.email ?? undefined,
        phoneno: u?.phoneno ?? undefined,
        gender: u?.gender ?? undefined,
        user_type: u?.user_type ?? undefined,
      },
    });
  }

  clear(table: Table) {
    table.clear();
    this.searchValue = ''
  }

  status(id: any, status: any) {
    this.btnDisable=true;
    if (status == 'Accepted') {
      this.acceptLoading = true;
      const formData = {
        status: 'Accepted'
      }
      this.editStatus(id, formData, true);
      return;
    } else if (status == 'Declined') {
      const formData = {
        status: 'Declined'
      }
      this.editStatus(id, formData, false);
      this.getUser();

      return;
    } else {
      const formData = {
        status: 'pending'
      }
      this.editStatus(id, formData, false);
      this.getUser();

      return;

    }
  }

  editStatus(id: any, status: any, isAccept: boolean = false) {

    this.appointmentEndpoint.edit(id, status).subscribe({
      next: (response: any) => {
        this.btnDisable=false;
        this.acceptLoading = false;
        this.loadAppointments();
        
        if (isAccept) {
          // Close dialog after successful acceptance
          this.apptDetails = false;
        } else {
          // Update the appointment view for other status changes
          this.viewAppt(id);
        }
      },
      error: (error) => {
        console.error('Error updating appointment status:', error);
        this.btnDisable = false;
        this.acceptLoading = false;
        const msg = error?.error?.error || error?.error?.message || 'Could not update appointment';
        if (error?.status === 403) {
          this.messageService.add({ severity: 'warn', summary: 'Action blocked', detail: msg });
        } else {
          this.messageService.add({ severity: 'error', summary: 'Error', detail: msg });
        }
      }
    })
  }
}
