import { Component, OnInit, OnDestroy } from '@angular/core';
import { environment } from '../../../../../environments/environment';
import { DoctorResource } from '../../../../../resources/doctor.model';
import { NurseResource } from '../../../../../resources/nurse.model';
import { UserResource } from '../../../../../resources/user.model';
import { ProfessionalResource } from '../../../../../resources/professional.model';
import { ProfessionalsService } from '../../../../endpoints/professionals.service';
import { UserService } from '../../../../endpoints/user.service';
import { Router } from '@angular/router';
import { Subject, Subscription } from 'rxjs';
import { debounceTime, distinctUntilChanged } from 'rxjs/operators';

type FilterType = '' | 'doctor' | 'nurse' | 'other_professional';
type FilterAvailability = '' | 'available' | 'unavailable';

@Component({
  selector: 'app-doctor-list',
  templateUrl: './doctor-list.component.html',
  styleUrl: './doctor-list.component.css'
})
export class DoctorListComponent implements OnInit, OnDestroy {
  id: any;
  user!: UserResource;
  avatar_file!: string;

  doctors: ProfessionalResource[] = [];
  nurses: ProfessionalResource[] = [];
  otherProfessionals: ProfessionalResource[] = [];

  loading = true;
  searchValue = '';
  filterType: FilterType = '';
  filterAvailability: FilterAvailability = '';
  showFilterDialog = false;

  summary = { total: 0, available: 0, unavailable: 0 };

  readonly filterTypeOptions: { label: string; value: FilterType }[] = [
    { label: 'All', value: '' },
    { label: 'Doctors', value: 'doctor' },
    { label: 'Nurses', value: 'nurse' },
    { label: 'Other Professionals', value: 'other_professional' },
  ];

  readonly filterAvailabilityOptions: { label: string; value: FilterAvailability }[] = [
    { label: 'All', value: '' },
    { label: 'Available', value: 'available' },
    { label: 'Unavailable', value: 'unavailable' },
  ];

  private readonly searchSubject = new Subject<string>();
  private readonly subscriptions = new Subscription();

  constructor(
    private userEndpoint: UserService,
    private professionalsService: ProfessionalsService,
    private readonly router: Router,
  ) {}

  ngOnInit(): void {
    this.id = localStorage.getItem('id');
    this.getUser();

    this.subscriptions.add(
      this.searchSubject.pipe(debounceTime(300), distinctUntilChanged()).subscribe(() => {
        this.loadProfessionals();
      })
    );

    this.loadProfessionals();
  }

  ngOnDestroy(): void {
    this.subscriptions.unsubscribe();
    this.searchSubject.complete();
  }

  getUser(): void {
    this.userEndpoint.get(this.id).subscribe({
      next: (response: any) => {
        this.user = response.user;
        this.avatar_file = environment.apiUrl + '/file/get/';
      }
    });
  }

  loadProfessionals(): void {
    this.loading = true;

    this.professionalsService.get({
      search: this.searchValue,
      type: this.filterType || undefined,
      availability: this.filterAvailability || undefined,
    }).subscribe({
      next: (response) => {
        this.doctors = this.mapDoctors((response.sections.doctors?.items || []) as DoctorResource[]);
        this.nurses = this.mapNurses((response.sections.nurses?.items || []) as NurseResource[]);
        this.otherProfessionals = this.mapOtherProfessionals(response.sections.other_professionals?.items || []);
        this.summary = response.summary || { total: 0, available: 0, unavailable: 0 };
        this.loading = false;
      },
      error: (err) => {
        console.error('Error loading professionals:', err);
        this.doctors = [];
        this.nurses = [];
        this.otherProfessionals = [];
        this.summary = { total: 0, available: 0, unavailable: 0 };
        this.loading = false;
      }
    });
  }

  onSearchInput(): void {
    this.searchSubject.next(this.searchValue);
  }

  openFilters(): void {
    this.showFilterDialog = true;
  }

  applyFilters(): void {
    this.showFilterDialog = false;
    this.loadProfessionals();
  }

  clearSearch(): void {
    this.searchValue = '';
    this.filterType = '';
    this.filterAvailability = '';
    this.loadProfessionals();
  }

  hasAnyResults(): boolean {
    return this.doctors.length > 0 || this.nurses.length > 0 || this.otherProfessionals.length > 0;
  }

  shouldShowSection(type: FilterType): boolean {
    if (!this.filterType) {
      return true;
    }
    return this.filterType === type;
  }

  getAvailabilityText(professional: ProfessionalResource): string {
    if (professional.type === 'doctor') {
      return professional.availability === '0' ? 'Unavailable' : 'Available';
    }
    return 'Available';
  }

  isAvailable(professional: ProfessionalResource): boolean {
    if (professional.type === 'doctor') {
      return professional.availability !== '0';
    }
    return true;
  }

  getSingleDoctor(id: number, type: 'doctor' | 'other_professional' | 'nurse' = 'doctor'): void {
    if (type === 'nurse') {
      this.router.navigate([`panel/nurses/nurse-profile/`, id]);
      return;
    }

    this.router.navigate([`panel/doctors/profile/`, id], { queryParams: { type } });
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
      doctor,
      registration_complete: (doctor as any).registration_complete === true,
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
      nurse,
      registration_complete: (nurse as any).registration_complete === true,
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
      otherProfessional: op,
      registration_complete: op.registration_complete === true,
    }));
  }
}
