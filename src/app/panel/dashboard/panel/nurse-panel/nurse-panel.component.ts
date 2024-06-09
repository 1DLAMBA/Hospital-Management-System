import { Component, OnInit } from '@angular/core';
import { UserService } from '../../../../endpoints/user.service';
import { UserResource } from '../../../../../resources/user.model';

@Component({
  selector: 'app-nurse-panel',
  templateUrl: './nurse-panel.component.html',
  styleUrl: './nurse-panel.component.css'
})
export class NursePanelComponent  implements OnInit {
  id: any;
  user!: UserResource
  data: any;
  options: any;
  products!: any;
  date: Date[] | undefined;
  upc_appt!: any[];

  constructor(private userEndpoint: UserService){
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
                    color: 'black'
                }
            }
        },
        scales: {
            x: {
                ticks: {
                    color: 'black',
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
                    color: 'black'
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
  }
  
  
  getUser (){
    this.userEndpoint.get(this.id).subscribe({
      next: (response: any) => {
        this.user = response.user
        
      }
    })
  }

}
