// src/app/features/forms/forms.component.ts
import { Component, OnInit } from '@angular/core';
import { ApiService } from '../../core/services/api.service';
import { LayoutComponent } from 'src/app/shared/components/layout/layout.component';
import { FormsModule } from '@angular/forms';

declare var toastr: any;
declare var bootstrap: any;

@Component({
  standalone:true,
  imports:[LayoutComponent,FormsModule],
  selector: 'app-forms-page',
  templateUrl: './forms.component.html'
})
export class FormsPageComponent implements OnInit {
  forms: any[] = [];
  searchText = '';
  isSubmitting = false;

  typeOptions: any[] = [];
  locationOptions: any[] = [];
  questionOptions: any[] = [];

  form: any = {
    name: '', type: '', t_start: '', t_end: '',
    locations: '', detail: '', round: '', subjects: []
  };

  constructor(private api: ApiService) {}

  ngOnInit(): void {
    this.loadForms();
    this.loadDropdowns();
  }

  get filteredList() {
    const s = this.searchText.toLowerCase();
    return this.forms.filter(f =>
      (f.name || '').toLowerCase().includes(s) ||
      (f.type || '').toLowerCase().includes(s)
    );
  }

  loadForms(): void {
    this.api.get<any>('training/form').subscribe({
      next: res => { this.forms = res.data || []; },
      error: () => {}
    });
  }

  loadDropdowns(): void {
    this.api.get<any>('master/training').subscribe(res => { this.typeOptions = res.data || []; });
    this.api.get<any>('master/location').subscribe(res => { this.locationOptions = res.data || []; });
    this.api.get<any>('quest').subscribe(res => { this.questionOptions = res.data || []; });
  }

  openNewForm(): void {
    this.form = { name:'', type:'', t_start:'', t_end:'', locations:'', detail:'', round:'', subjects:[] };
    new bootstrap.Modal(document.getElementById('formModal')).show();
  }

  submitForm(): void {
    if (!this.form.name || !this.form.type) { toastr.warning('Please fill required fields'); return; }
    this.isSubmitting = true;
    this.api.post<any>('training/form', this.form).subscribe({
      next: res => {
        toastr.success(res.message || 'Form submitted');
        this.isSubmitting = false;
        bootstrap.Modal.getInstance(document.getElementById('formModal'))?.hide();
        this.loadForms();
      },
      error: () => { this.isSubmitting = false; toastr.error('Failed'); }
    });
  }
}
