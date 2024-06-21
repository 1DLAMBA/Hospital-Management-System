import { Component, OnInit } from '@angular/core';
import { UserService } from '../../../../endpoints/user.service';
import { UserResource } from '../../../../../resources/user.model';
import { AppointmentsService } from '../../../../endpoints/appointments.service';
import { DoctorsService } from '../../../../endpoints/doctors.service';
import { DoctorResource } from '../../../../../resources/doctor.model';
import { response } from 'express';
import { AppointmentResource } from '../../../../../resources/appointment.model';


@Component({
  selector: 'app-doctor-panel',
  templateUrl: './doctor-panel.component.html',
  styleUrl: './doctor-panel.component.css'
})
export class DoctorPanelComponent implements OnInit {
  id: any;
  user!: any;
  data: any;
  options: any;
  products!: any;
  date: Date[] | undefined;
  upc_appt!: any[];
  doctor!: DoctorResource;
  appointment!: AppointmentResource[];

  constructor(
    private userEndpoint: UserService,
    private doctorEndpoint: DoctorsService,
    private appointmentEndpoint: AppointmentsService,
    ){
    this.upc_appt =[
      {status: 'Ali Muhammed - General checkup', date:'12/10/2020 10:30', icon: 'pi pi-shopping-cart', color:'#0055aa' },
      {status: 'Ali Muhammed - General checkup', date:'12/10/2020 10:30', icon: 'pi pi-shopping-cart', color:'#0055aa' },
      {status: 'Ali Muhammed - General checkup', date:'12/10/2020 10:30', icon: 'pi pi-shopping-cart', color:'#0055aa' },
      {status: 'Ali Muhammed - General checkup', date:'12/10/2020 10:30', icon: 'pi pi-shopping-cart', color:'#0055aa' },

    ]
  }
  ngOnInit(): void {
    const documentStyle = getComputedStyle(document.documentElement);
        const textColor = documentStyle.getPropertyValue('--text-color');
        const textColorSecondary = documentStyle.getPropertyValue('--text-color-secondary');
        const surfaceBorder = documentStyle.getPropertyValue('--surface-border');
        this.data = {
          labels: ['Mon', 'Tue', 'Wed', 'Thur', 'Fri', 'Sat', 'Sun'],
          datasets: [
              {
                  label: 'Male',
                  backgroundColor: '#0055aa',
                  borderColor: '#0055aa',
                  data: [65, 59, 80, 81, 56, 55, 40]
              },
              {
                  label: 'Female',
                  backgroundColor: '#7A8AB5',
                  borderColor: '#7A8AB5',
                  data: [28, 48, 40, 19, 86, 27, 90]
              }
          ]
      };

      this.options = {
        maintainAspectRatio: false,
        aspectRatio: 0.8,
        plugins: {
            legend: {
                labels: {
                    color: 'white'
                }
            }
        },
        scales: {
            x: {
                ticks: {
                    color: 'white',
                    font: {
                        weight: 500
                    }
                },
                grid: {
                    color: '#31385261',
                    drawBorder: false
                }
            },
            y: {
                ticks: {
                    color: 'white'
                },
                grid: {
                    color: '#31385261',
                    drawBorder: false
                }
            }

        }
    };
    this.products = [
      {
        name: 'John Doe',
        serial: '1',
        category: 'gyan',
        patient: 'good'
      },
      {
        name: 'Samuel Larry',
        serial: '2',
        category: 'gyan',
        patient: 'good'
      },
      {
        name: 'Gideon Oj',
        serial: '3',
        category: 'Dark',
        patient: 'good'
      },
    ]
    this.id=localStorage.getItem('id')
    this.getUser();
    this.getDocUser();
    this.getDocAppt();
  }
  
  
  getUser (){
    this.userEndpoint.get(this.id).subscribe({
      next: (response: any) => {
        this.user = response.user
        this.appointmentEndpoint.get(this.user.doctors.id, 'doctor').subscribe({
          next: (response: any)=>{
            this.appointment = response.appointments
          }
        })
        
      }
    })
      
    
  }

  getDocUser (){
    this.doctorEndpoint.getDocUser(this.id).subscribe({
      next: (response: any) => {
        this.doctor = response.doctor;
        
      }
    })
  }

  getDocAppt(){
    // console.log('HERE', this.doctor);
    console.log('HERE', this.user.doctors.id);
  
  }

}
