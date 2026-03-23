// src/app/features/members/members.component.ts
import { Component, OnInit } from '@angular/core';
import { Router } from '@angular/router';
import { ApiService } from '../../core/services/api.service';
import { FormsModule } from '@angular/forms';
import { LayoutComponent } from 'src/app/shared/components/layout/layout.component';

declare var toastr: any;
declare var bootstrap: any;

@Component({
  standalone:true,
  imports:[FormsModule,LayoutComponent],
  selector: 'app-members',
  templateUrl: './members.component.html'
})
export class MembersComponent implements OnInit {
  members: any[] = [];
  searchText = '';
  isSubmitting = false;
  isEditMode = false;
  currentId: any = null;

  filters = { district: '', school: '', subject: '' };
  districtOptions: string[] = [];
  subjectOptions: string[] = [];

  form: any = {
    name: '', staff_id: '', mobile: '', email: '',
    district: '', school: '', subject: '', designation: ''
  };

  constructor(private api: ApiService, private router: Router) {}

  ngOnInit(): void { this.load(); }

  get filteredList() {
    const s = this.searchText.toLowerCase();
    return this.members.filter(m =>
      (m.name || '').toLowerCase().includes(s) ||
      (m.district || '').toLowerCase().includes(s) ||
      (m.subject || '').toLowerCase().includes(s)
    );
  }

  load(): void {
    this.api.get<any>('user/member').subscribe(res => {
      this.members = res.data || [];
    });
  }

  openNewMember(): void {
    this.isEditMode = false;
    this.currentId = null;
    this.form = { name:'', staff_id:'', mobile:'', email:'', district:'', school:'', subject:'', designation:'' };
    new bootstrap.Modal(document.getElementById('memberModal')).show();
  }

  openEditMember(m: any): void {
    this.isEditMode = true;
    this.currentId = m.id;
    this.form = { ...m };
    new bootstrap.Modal(document.getElementById('memberModal')).show();
  }

  submitMember(): void {
    if (!this.form.name) { toastr.warning('Please fill required fields'); return; }
    this.isSubmitting = true;
    const req = this.isEditMode
      ? this.api.put<any>(`user/member/${this.currentId}`, this.form)
      : this.api.post<any>('user/member', this.form);
    req.subscribe({
      next: res => {
        toastr.success(res.message || 'Success');
        this.isSubmitting = false;
        bootstrap.Modal.getInstance(document.getElementById('memberModal'))?.hide();
        this.load();
      },
      error: () => { this.isSubmitting = false; toastr.error('Failed'); }
    });
  }

  goToReport(id: number): void {
    this.router.navigate(['/reports/member'], { queryParams: { member: id } });
  }
}
