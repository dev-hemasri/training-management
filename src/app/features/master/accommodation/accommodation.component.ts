// src/app/features/master/accommodation/accommodation.component.ts
import { Component, OnInit } from '@angular/core';
import { ApiService } from '../../../core/services/api.service';
import { FormsModule } from '@angular/forms';
import { LayoutComponent } from 'src/app/shared/components/layout/layout.component';

declare var bootstrap: any;
declare var toastr: any;

@Component({
  standalone:true,
  imports:[FormsModule,LayoutComponent],
  selector: 'app-accommodation',
  templateUrl: './accommodation.component.html'
})
export class AccommodationComponent implements OnInit {
  accommodations: any[] = [];
  searchText = '';
  isSubmitting = false;

  newAccom = { name: '', link: '' };
  editAccom = { id: null, name: '', link: '' };

  constructor(private api: ApiService) {}

  ngOnInit(): void { this.load(); }

  get filteredList() {
    const s = this.searchText.toLowerCase();
    return this.accommodations.filter(a =>
      a.name.toLowerCase().includes(s) || (a.link || '').toLowerCase().includes(s)
    );
  }

  load(): void {
    this.api.get<any>('master/accomdation').subscribe(res => {
      this.accommodations = res.data || [];
    });
  }

  openNewModal(): void {
    this.newAccom = { name: '', link: '' };
    new bootstrap.Modal(document.getElementById('newAccomModal')).show();
  }

  openEditModal(a: any): void {
    this.editAccom = { id: a.id, name: a.name, link: a.link };
    new bootstrap.Modal(document.getElementById('editAccomModal')).show();
  }

  submitAccom(): void {
    if (!this.newAccom.name || !this.newAccom.link) { toastr.warning('Please fill all required fields'); return; }
    this.isSubmitting = true;
    this.api.post<any>('master/accomdation', this.newAccom).subscribe({
      next: res => {
        toastr.success(res.message);
        this.isSubmitting = false;
        bootstrap.Modal.getInstance(document.getElementById('newAccomModal'))?.hide();
        this.load();
      },
      error: () => { this.isSubmitting = false; }
    });
  }

  updateAccom(): void {
    if (!this.editAccom.name || !this.editAccom.link) { toastr.warning('Please fill all required fields'); return; }
    this.isSubmitting = true;
    this.api.put<any>(`master/accomdation/${this.editAccom.id}`, this.editAccom).subscribe({
      next: res => {
        toastr.success(res.message);
        this.isSubmitting = false;
        bootstrap.Modal.getInstance(document.getElementById('editAccomModal'))?.hide();
        this.load();
      },
      error: () => { this.isSubmitting = false; }
    });
  }
}
