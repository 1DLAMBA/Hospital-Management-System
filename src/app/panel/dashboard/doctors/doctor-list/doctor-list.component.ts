import { Component, OnInit, OnDestroy } from '@angular/core';
import { environment } from '../../../../../environments/environment';
import { DoctorResource } from '../../../../../resources/doctor.model';
import { NurseResource } from '../../../../../resources/nurse.model';
import { UserResource } from '../../../../../resources/user.model';
import { ProfessionalResource } from '../../../../../resources/professional.model';
import { DoctorsService } from '../../../../endpoints/doctors.service';
import { NursesService } from '../../../../endpoints/nurses.service';
import { OtherProfessionalsService } from '../../../../endpoints/other-professionals.service';
import { UserService } from '../../../../endpoints/user.service';
import { forkJoin, Subscription } from 'rxjs';
import {
  ActivatedRoute,
  Router,
  NavigationEnd,
} from '@angular/router';
import { filter } from 'rxjs/operators';



@Component({
  selector: 'app-doctor-list',
  templateUrl: './doctor-list.component.html',
  styleUrl: './doctor-list.component.css'
})
export class DoctorListComponent implements OnInit, OnDestroy{
  id: any;
  user!: UserResource;
  firstName!: string;
  avatar_file!:string;
  doctors!: DoctorResource[];
  professionals!: ProfessionalResource[]; // Unified list
  filteredProfessionals!: ProfessionalResource[]; // Filtered list for display
  SingleDoctor!: DoctorResource;
  searchValue: string | undefined;
  showdoc: boolean = false;
  availableCount: number = 0;
  unavailableCount: number = 0;
  currentType: 'all' | 'doctor' | 'nurse' | 'other_professional' = 'all';
  
  private routerSubscription?: Subscription;
  private queryParamsSubscription?: Subscription;
  private isComponentActive: boolean = true;

  constructor(
    private userEndpoint: UserService,
    private doctorEndpoint: DoctorsService,
    private nurseEndpoint: NursesService,
    private otherProfessionalEndpoint: OtherProfessionalsService,
    private readonly route: ActivatedRoute,
    private readonly router: Router,

  ){

  }

  ngOnInit(): void {
    this.id=localStorage.getItem('id');
    this.isComponentActive = true;
    this.getUser();
    this.queryParamsSubscription = this.route.queryParams.subscribe((params) => {
      this.currentType = this.normalizeType(params['type']);
      this.getProfessionalsByType();
    });
    
    // Subscribe to router navigation events to detect when navigating to this component
    // This handles the case where component is reused
    this.routerSubscription = this.router.events.pipe(
      filter((event): event is NavigationEnd => event instanceof NavigationEnd)
    ).subscribe((event) => {
      if (!this.isComponentActive) return;
      
      const currentUrl = event.urlAfterRedirects || event.url;
      
      // If we're on the doctors list route, reload data
      // This ensures data is refreshed even when component is reused
      if (currentUrl.includes('/panel/doctors') && !currentUrl.includes('/profile/')) {
        // Use setTimeout to avoid multiple rapid calls and ensure component is ready
        setTimeout(() => {
          if (this.isComponentActive && this.router.url === currentUrl) {
            this.getProfessionalsByType();
          }
        }, 100);
      }
    });
  }

  ngOnDestroy(): void {
    this.isComponentActive = false;
    if (this.routerSubscription) {
      this.routerSubscription.unsubscribe();
    }
    if (this.queryParamsSubscription) {
      this.queryParamsSubscription.unsubscribe();
    }
  }

  loadData(): void {
    this.getUser();
    this.getProfessionalsByType();
  }

  clearSearch() {
    this.searchValue = '';
    this.filterProfessionals();
  }

  filterProfessionals() {
    if (!this.professionals) {
      this.filteredProfessionals = [];
      return;
    }

    if (!this.searchValue || this.searchValue.trim() === '') {
      this.filteredProfessionals = this.professionals;
      return;
    }

    const searchTerm = this.searchValue.toLowerCase().trim();
    this.filteredProfessionals = this.professionals.filter(professional => 
      professional.user.name.toLowerCase().includes(searchTerm) ||
      professional.specialization?.toLowerCase().includes(searchTerm) ||
      professional.displayType.toLowerCase().includes(searchTerm) ||
      professional.user.email?.toLowerCase().includes(searchTerm)
    );
  }

  getAvailabilityIcon(professional: ProfessionalResource): string {
    if (professional.type === 'doctor' && professional.availability === '1') {
      return 'pi-check-circle';
    } else if (professional.type === 'doctor' && professional.availability === '0') {
      return 'pi-times-circle';
    }
    return 'pi-info-circle';
  }

  getAvailabilityText(professional: ProfessionalResource): string {
    if (professional.type === 'doctor' && professional.availability === '1') {
      return 'Available';
    } else if (professional.type === 'doctor' && professional.availability === '0') {
      return 'Unavailable';
    }
    return 'Available';
  }

  getUser (){
    this.userEndpoint.get(this.id).subscribe({
      next: (response: any) => {
        this.user = response.user
        this.avatar_file = environment.apiUrl + '/file/get/';        
      }
    })
  }

  getProfessionalsByType(): void {
    switch (this.currentType) {
      case 'doctor':
        this.doctorEndpoint.get().subscribe({
          next: (response: any) => {
            const verifiedDoctors = (response.doctor || []).filter((doctor: DoctorResource) =>
              doctor.user && doctor.user.email_verified_at
            );
            this.doctors = verifiedDoctors;
            this.professionals = this.mapDoctors(verifiedDoctors);
            this.professionals = this.sortProfessionalsByName(this.professionals);
            this.filteredProfessionals = this.professionals;
            this.calculateAvailabilityCounts();
          },
          error: (err) => {
            console.error('Error loading doctors:', err);
            this.professionals = [];
            this.filteredProfessionals = [];
            this.calculateAvailabilityCounts();
          }
        });
        break;

      case 'nurse':
        this.nurseEndpoint.get(undefined, 1, 1000).subscribe({
          next: (response: any) => {
            const verifiedNurses = (response.nurse || []).filter((nurse: NurseResource) =>
              nurse.user && nurse.user.email_verified_at
            );
            this.professionals = this.mapNurses(verifiedNurses);
            this.professionals = this.sortProfessionalsByName(this.professionals);
            this.filteredProfessionals = this.professionals;
            this.calculateAvailabilityCounts();
          },
          error: (err) => {
            console.error('Error loading nurses:', err);
            this.professionals = [];
            this.filteredProfessionals = [];
            this.calculateAvailabilityCounts();
          }
        });
        break;

      case 'other_professional':
        this.otherProfessionalEndpoint.get().subscribe({
          next: (response: any) => {
            const verifiedOtherProfessionals = (response.other_professional || []).filter((op: any) =>
              op.user && op.user.email_verified_at
            );
            this.professionals = this.mapOtherProfessionals(verifiedOtherProfessionals);
            this.professionals = this.sortProfessionalsByName(this.professionals);
            this.filteredProfessionals = this.professionals;
            this.calculateAvailabilityCounts();
          },
          error: (err) => {
            console.error('Error loading other professionals:', err);
            this.professionals = [];
            this.filteredProfessionals = [];
            this.calculateAvailabilityCounts();
          }
        });
        break;

      default:
        forkJoin({
          doctors: this.doctorEndpoint.get(),
          otherProfessionals: this.otherProfessionalEndpoint.get()
        }).subscribe({
          next: (responses: any) => {
            const verifiedDoctors = (responses.doctors.doctor || []).filter((doctor: DoctorResource) =>
              doctor.user && doctor.user.email_verified_at
            );
            this.doctors = verifiedDoctors;
            const verifiedOtherProfessionals = (responses.otherProfessionals.other_professional || []).filter((op: any) =>
              op.user && op.user.email_verified_at
            );

            const doctorsList = this.mapDoctors(verifiedDoctors);
            const otherProfessionalsList = this.mapOtherProfessionals(verifiedOtherProfessionals);
            this.professionals = this.sortProfessionalsByName([...doctorsList, ...otherProfessionalsList]);
            this.filteredProfessionals = this.professionals;
            this.calculateAvailabilityCounts();
          },
          error: (err) => {
            console.error('Error loading professionals:', err);
            this.professionals = [];
            this.filteredProfessionals = [];
            this.calculateAvailabilityCounts();
          }
        });
        break;
    }
  }

  mapDoctors(doctors: DoctorResource[]): ProfessionalResource[] {
    return doctors.map((doctor: DoctorResource) => ({
      id: doctor.id,
      type: 'doctor',
      displayType: 'Doctor',
      user: doctor.user,
      specialization: doctor.specialization,
      license_number: doctor.license_number,
      med_school: doctor.med_school,
      grad_year: doctor.grad_year,
      degree_file: doctor.degree_file,
      availability: doctor.availability,
      doctor: doctor
    }));
  }

  mapNurses(nurses: NurseResource[]): ProfessionalResource[] {
    return nurses.map((nurse: NurseResource) => ({
      id: nurse.id,
      type: 'nurse',
      displayType: 'Nurse',
      user: nurse.user as UserResource,
      specialization: nurse.specialization,
      license_number: nurse.license_number,
      med_school: nurse.med_school,
      grad_year: nurse.grad_year,
      degree_file: nurse.degree_file,
      availability: nurse.availability,
      nurse: nurse
    }));
  }

  mapOtherProfessionals(otherProfessionals: any[]): ProfessionalResource[] {
    return otherProfessionals.map((op: any) => ({
      id: op.id,
      type: 'other_professional',
      displayType: op.professional_type || 'Other Professional',
      user: op.user,
      specialization: op.specialization,
      license_number: op.license_number,
      med_school: op.med_school,
      grad_year: op.grad_year,
      degree_file: op.degree_file,
      professional_type: op.professional_type,
      otherProfessional: op
    }));
  }

  sortProfessionalsByName(professionals: ProfessionalResource[]): ProfessionalResource[] {
    return professionals.sort((a, b) => a.user.name.localeCompare(b.user.name));
  }

  normalizeType(type: any): 'all' | 'doctor' | 'nurse' | 'other_professional' {
    if (type === 'doctor' || type === 'nurse' || type === 'other_professional') {
      return type;
    }
    return 'all';
  }

  getCurrentTypeLabel(): string {
    switch (this.currentType) {
      case 'doctor':
        return 'Doctors';
      case 'nurse':
        return 'Nurses';
      case 'other_professional':
        return 'Other Professionals';
      default:
        return 'Healthcare Professionals';
    }
  }

  getSingleDoctor(id: any, type: 'doctor' | 'other_professional' | 'nurse' = 'doctor'){
    if (type === 'nurse') {
      this.router.navigate([`panel/nurses/nurse-profile/`, id]);
      return;
    }

    // Route both doctors and other_professionals to the same profile component
    // Pass the type as a query parameter so the profile component knows which endpoint to use
    this.router.navigate([`panel/doctors/profile/`, id], { queryParams: { type: type } })
  }

  calculateAvailabilityCounts() {
    if (!this.professionals) {
      this.availableCount = 0;
      this.unavailableCount = 0;
      return;
    }

    const withAvailability = this.professionals.filter((p) => p.availability !== undefined && p.availability !== null);

    if (withAvailability.length === 0) {
      this.availableCount = this.professionals.length;
      this.unavailableCount = 0;
      return;
    }

    this.availableCount = withAvailability.filter((p) => p.availability === '1').length;
    this.unavailableCount = withAvailability.filter((p) => p.availability === '0').length;
  }

}
