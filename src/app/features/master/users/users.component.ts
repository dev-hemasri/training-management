// src/app/features/master/users/users.component.ts
import { Component, OnInit } from '@angular/core';
import { ApiService } from '../../../core/services/api.service';
import { FormsModule } from '@angular/forms';
import { CommonModule } from '@angular/common';
import { LayoutComponent } from 'src/app/shared/components/layout/layout.component';

declare var bootstrap: any;
declare var toastr: any;

@Component({
  imports:[FormsModule,CommonModule,LayoutComponent],
  selector: 'app-users',
  templateUrl: './users.component.html'
})
export class UsersComponent implements OnInit {
  users: any[] = [];
  searchText = '';
  isSubmitting = false;
  isEditMode = false;
  currentId: any = null;
  autoFilled = false;
  staffSuggestions: any[] = [];
  private staffTimer: any;
  selectedFile: File | null = null;

  form = {
    staff_id: '', name: '', username: '', mobile: '', email: '',
    district: '', vertical: '', role: '', password: '', notes: ''
  };

  districts = [
    'All','Ariyalur','Chengalpattu','Chennai','CoAE','Coimbatore','Cuddalore',
    'Dharmapuri','Dindigul','Erode','Kallakurichi','Kancheepuram','Kanyakumari',
    'Karur','Krishnagiri','Madurai','Mayiladuthurai','Nagapattinam','Namakkal',
    'Perambalur','Pudukottai','Ramanadhapuram','Ranipet','Salem','Sivagangai',
    'Tenkasi','Thanjavur','The Nilgiris','Theni','Thoothukudi','Tirunelveli',
    'Tirupathur','Tirupur','Tiruvallur','Tiruvannamalai','Tiruvarur','Trichy',
    'Vellore','Villupuram','Virudhunagar'
  ];

  get isSuperAdmin(): boolean { return localStorage.getItem('trole') === 'Super Admin'; }

  constructor(private api: ApiService) {}

  ngOnInit(): void { this.load(); }

  get filteredList() {
    const s = this.searchText.toLowerCase();
    return this.users.filter(u =>
      (u.name || '').toLowerCase().includes(s) ||
      (u.username || '').toLowerCase().includes(s) ||
      (u.role || '').toLowerCase().includes(s)
    );
  }

  load(): void {
    this.api.get<any>('user/list/all').subscribe(res => { this.users = res.data || []; });
  }

  openNewUserModal(): void {
    this.isEditMode = false;
    this.currentId = null;
    this.autoFilled = false;
    this.staffSuggestions = [];
    this.form = { staff_id:'', name:'', username:'', mobile:'', email:'', district:'', vertical:'', role:'', password:'', notes:'' };
    new bootstrap.Modal(document.getElementById('userModal')).show();
  }

  openEditUser(u: any): void {
    this.isEditMode = true;
    this.currentId = u.id;
    this.autoFilled = false;
    this.form = {
      staff_id: u.staff_id || '', name: u.name || '', username: u.username || '',
      mobile: u.mobile || '', email: u.email || '', district: u.district || '',
      vertical: u.vertical || '', role: u.role || '', password: '', notes: u.notes || ''
    };
    new bootstrap.Modal(document.getElementById('userModal')).show();
  }

  searchStaff(): void {
    clearTimeout(this.staffTimer);
    if (this.form.staff_id.length < 3) { this.staffSuggestions = []; return; }
    this.staffTimer = setTimeout(() => {
      this.api.get<any>(`user/member-lookup?staff_id=${this.form.staff_id}`).subscribe({
        next: res => {
          let data = res.data;
          this.staffSuggestions = Array.isArray(data) ? data : (data ? [data] : []);
        },
        error: () => { this.staffSuggestions = []; }
      });
    }, 500);
  }

  selectStaff(s: any): void {
    if (!s.vertical) { toastr.error('Vertical is empty! Cannot create user for this person.'); return; }
    this.form.staff_id = s.staff_id || '';
    this.form.name = s.name || '';
    this.form.mobile = s.mobile || '';
    this.form.email = s.email || '';
    this.form.district = s.district || '';
    this.form.vertical = s.vertical || '';
    this.autoFilled = true;
    this.staffSuggestions = [];
  }

  submitUser(): void {
    if (!this.form.name || !this.form.username || !this.form.role) {
      toastr.warning('Please fill all required fields'); return;
    }
    if (!this.isEditMode && !this.form.password) {
      toastr.warning('Password is required for new users'); return;
    }
    if (this.form.password && this.form.password.length < 6) {
      toastr.warning('Password must be at least 6 characters'); return;
    }

    this.isSubmitting = true;
    const payload: any = { ...this.form };
    if (!payload.password) delete payload.password;

    const req = this.isEditMode
      ? this.api.put<any>(`user/update/${this.currentId}`, payload)
      : this.api.post<any>('user/create', payload);

    req.subscribe({
      next: res => {
        toastr.success(res.message || 'Success');
        this.isSubmitting = false;
        bootstrap.Modal.getInstance(document.getElementById('userModal'))?.hide();
        this.load();
      },
      error: err => {
        this.isSubmitting = false;
        toastr.error(err?.error?.error || 'Operation failed.');
      }
    });
  }

  confirmDeleteUser(): void {
    new bootstrap.Modal(document.getElementById('deleteUserModal')).show();
  }

  deleteUser(): void {
    this.api.put<any>(`user/update/${this.currentId}`, { status: 'Delete' }).subscribe({
      next: res => {
        toastr.success(res.message);
        bootstrap.Modal.getInstance(document.getElementById('deleteUserModal'))?.hide();
        bootstrap.Modal.getInstance(document.getElementById('userModal'))?.hide();
        this.load();
      },
      error: () => toastr.error('Delete failed.')
    });
  }

  openUploadModal(): void {
    this.selectedFile = null;
    new bootstrap.Modal(document.getElementById('uploadModal')).show();
  }

  onFileSelect(event: any): void {
    this.selectedFile = event.target.files[0] || null;
  }

  // submitUpload(): void {
  //   if (!this.selectedFile) { toastr.warning('Please select a file'); return; }
  //   const formData = new FormData();
  //   formData.append('user_file', this.selectedFile);
  //   const token = localStorage.getItem('Authorization') || '';
  //   this.isSubmitting = true;
  //   this.http.post<any>('https://training.masclass.in/api/v1/user/bulk/user-bulk-upload', formData,
  //     { headers: new HttpHeaders({ Authorization: token }) }
  //   ).subscribe({
  //     next: res => {
  //       toastr.success(res.message || 'Bulk upload completed');
  //       this.isSubmitting = false;
  //       bootstrap.Modal.getInstance(document.getElementById('uploadModal'))?.hide();
  //       this.load();
  //     },
  //     error: err => {
  //       this.isSubmitting = false;
  //       toastr.error(err?.error?.message || 'Bulk upload failed');
  //     }
  //   });
  // }
  submitUpload(): void {
  if (!this.selectedFile) { toastr.warning('Please select a file'); return; }

  const formData = new FormData();
  formData.append('user_file', this.selectedFile);

  this.isSubmitting = true;

  this.api.post<any>('user/bulk/user-bulk-upload', formData).subscribe({
    next: res => {
      toastr.success(res.message || 'Bulk upload completed');
      this.isSubmitting = false;
      bootstrap.Modal.getInstance(document.getElementById('uploadModal'))?.hide();
      this.load();
    },
    error: err => {
      this.isSubmitting = false;
      toastr.error(err?.error?.message || 'Bulk upload failed');
    }
  });
}
}
