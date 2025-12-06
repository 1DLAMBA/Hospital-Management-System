import { Component, Input, Output, EventEmitter } from '@angular/core';
import { CommonModule } from '@angular/common';
import { DialogModule } from 'primeng/dialog';
import { ButtonModule } from 'primeng/button';
import { MedicalRecordResource } from '../../../../resources/medicalrecord.model';
import { ClientResource } from '../../../../resources/client.model';
import { environment } from '../../../../environments/environment';

@Component({
  selector: 'app-medical-record-view',
  standalone: true,
  imports: [CommonModule, DialogModule, ButtonModule],
  templateUrl: './medical-record-view.component.html',
  styleUrl: './medical-record-view.component.css'
})
export class MedicalRecordViewComponent {
  @Input() medicalRecord: MedicalRecordResource | null = null;
  @Input() client: ClientResource | null = null;
  @Input() visible: boolean = false;
  @Output() visibleChange = new EventEmitter<boolean>();
  @Output() onClose = new EventEmitter<void>();

  avatar_file: string = environment.apiUrl + '/file/get/';

  closeDialog() {
    this.visible = false;
    this.visibleChange.emit(false);
    this.onClose.emit();
  }

  printMedRecord() {
    const printContents = document.getElementById('printable-med-record')?.innerHTML;
    if (printContents) {
      const printWindow = window.open('', '', 'height=600,width=800');
      if (printWindow) {
        printWindow.document.write('<html><head><title>Medical Record - ' + (this.medicalRecord?.record_number || 'Record') + '</title>');
        printWindow.document.write('<style>');
        printWindow.document.write('body{font-family:"Segoe UI",Arial,sans-serif;margin:0;padding:20px;color:#111827;background:#fff;}');
        printWindow.document.write('.patient-info-section{display:flex;gap:1.5rem;margin-bottom:1.5rem;padding-bottom:1.5rem;border-bottom:1px solid #e5e7eb;}');
        printWindow.document.write('.patient-photo{width:80px;height:80px;border-radius:8px;border:1px solid #e5e7eb;}');
        printWindow.document.write('.patient-details-list{flex:1;display:flex;flex-direction:column;gap:0.5rem;}');
        printWindow.document.write('.detail-row{display:flex;gap:0.5rem;}');
        printWindow.document.write('.detail-label{font-size:0.875rem;font-weight:600;color:#6b7280;min-width:100px;}');
        printWindow.document.write('.detail-value{font-size:0.875rem;color:#111827;}');
        printWindow.document.write('.medical-section{padding-bottom:1rem;border-bottom:1px solid #e5e7eb;margin-bottom:1rem;}');
        printWindow.document.write('.section-title{margin:0 0 0.5rem 0;font-size:0.95rem;font-weight:600;color:#17224d;}');
        printWindow.document.write('.section-text{font-size:0.875rem;line-height:1.6;color:#374151;margin:0;}');
        printWindow.document.write('.section-text-empty{font-size:0.875rem;color:#9ca3af;font-style:italic;margin:0;}');
        printWindow.document.write('.signature-section{margin-top:2.5rem;padding-top:1.5rem;border-top:2px solid #e5e7eb;page-break-inside:avoid;}');
        printWindow.document.write('.signature-wrapper{display:flex;justify-content:space-between;align-items:flex-start;gap:3rem;margin-top:1rem;}');
        printWindow.document.write('.signature-container{display:flex;flex-direction:column;align-items:flex-start;gap:0.75rem;flex:1;}');
        printWindow.document.write('.signature-label{font-size:0.875rem;color:#374151;font-weight:600;text-transform:uppercase;letter-spacing:0.5px;}');
        printWindow.document.write('.signature-image-wrapper{border-bottom:2px solid #111827;padding-bottom:0.5rem;min-width:250px;max-width:300px;}');
        printWindow.document.write('.signature-image{max-width:100%;max-height:70px;object-fit:contain;display:block;}');
        printWindow.document.write('.doctor-name{font-size:0.9rem;color:#111827;font-weight:600;margin-top:0.5rem;padding-top:0.5rem;border-top:1px solid #e5e7eb;width:100%;}');
        printWindow.document.write('.doctor-credentials{font-size:0.8rem;color:#6b7280;font-style:italic;margin-top:0.25rem;}');
        printWindow.document.write('.signature-date{display:flex;flex-direction:column;gap:0.5rem;align-items:flex-end;justify-content:flex-start;padding-top:2rem;}');
        printWindow.document.write('.date-label{font-size:0.875rem;color:#6b7280;font-weight:500;}');
        printWindow.document.write('.date-value{font-size:0.875rem;color:#111827;font-weight:500;}');
        printWindow.document.write('.record-footer-info{margin-top:1rem;padding-top:1rem;border-top:1px solid #e5e7eb;text-align:right;}');
        printWindow.document.write('.record-footer-info small{font-size:0.75rem;color:#9ca3af;}');
        printWindow.document.write('@media print{body{padding:0;} .medical-section{margin-bottom:0.75rem;} .signature-section{page-break-inside:avoid;}}');
        printWindow.document.write('</style>');
        printWindow.document.write('</head><body>');
        printWindow.document.write(printContents);
        printWindow.document.write('</body></html>');
        printWindow.document.close();
        printWindow.print();
      }
    }
  }
}
