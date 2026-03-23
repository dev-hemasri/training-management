// src/app/features/master/training-location/training-location.component.ts
import { Component, OnInit } from '@angular/core';
import { ApiService } from '../../../core/services/api.service';
import { FormsModule } from '@angular/forms';
import { LayoutComponent } from 'src/app/shared/components/layout/layout.component';

declare var bootstrap: any;
declare var toastr: any;

@Component({
  standalone:true,
  imports:[FormsModule,LayoutComponent],
  selector: 'app-training-location',
  templateUrl: './training-location.component.html'
})
export class TrainingLocationComponent implements OnInit {
  locations: any[] = [];
  searchText = '';
  isSubmitting = false;

  newLocation = { name: '', places: [{ place: '', gps: '' }] };
  editLocation = { id: null, name: '', places: [{ place: '', gps: '' }] };

  constructor(private api: ApiService) {}

  ngOnInit(): void {
    this.loadLocations();
  }

  get filteredList() {
    const s = this.searchText.toLowerCase();
    return this.locations.filter(l => l.name.toLowerCase().includes(s));
  }

  loadLocations(): void {
    this.api.get<any>('master/location').subscribe(res => {
      this.locations = res.data || [];
    });
  }

  openNewModal(): void {
    this.newLocation = { name: '', places: [{ place: '', gps: '' }] };
    new bootstrap.Modal(document.getElementById('newLocationModal')).show();
  }

  openEditModal(loc: any): void {
    this.editLocation = {
      id: loc.id,
      name: loc.name,
      places: (loc.detail || []).map((d: any) => ({ place: d.place, gps: d.gps || '' }))
    };
    if (!this.editLocation.places.length) this.editLocation.places = [{ place: '', gps: '' }];
    new bootstrap.Modal(document.getElementById('editLocationModal')).show();
  }

  addPlaceField(arr: any[]): void {
    arr.push({ place: '', gps: '' });
  }

  removePlaceField(arr: any[], i: number): void {
    arr.splice(i, 1);
  }

  submitLocation(): void {
    if (!this.newLocation.name.trim()) { toastr.warning('Please enter Location Name'); return; }
    const detail = this.newLocation.places.filter(p => p.place.trim());
    if (!detail.length) { toastr.warning('Please add at least one place'); return; }

    this.isSubmitting = true;
    this.api.post<any>('master/location', { name: this.newLocation.name, detail }).subscribe({
      next: res => {
        toastr.success(res.message);
        this.isSubmitting = false;
        bootstrap.Modal.getInstance(document.getElementById('newLocationModal'))?.hide();
        this.loadLocations();
      },
      error: () => { this.isSubmitting = false; toastr.error('Failed to add location.'); }
    });
  }

  updateLocation(): void {
    if (!this.editLocation.name.trim()) { toastr.warning('Please enter Location Name'); return; }
    const detail = this.editLocation.places.filter(p => p.place.trim());

    this.isSubmitting = true;
    this.api.put<any>(`master/location/${this.editLocation.id}`, {
      name: this.editLocation.name, detail
    }).subscribe({
      next: res => {
        toastr.success(res.message);
        this.isSubmitting = false;
        bootstrap.Modal.getInstance(document.getElementById('editLocationModal'))?.hide();
        this.loadLocations();
      },
      error: () => { this.isSubmitting = false; toastr.error('Update failed.'); }
    });
  }

  confirmDelete(): void {
    new bootstrap.Modal(document.getElementById('deleteLocationModal')).show();
  }

  deleteLocation(): void {
    this.api.put<any>(`master/location/${this.editLocation.id}`, { status: 'Inactive' }).subscribe({
      next: () => {
        toastr.success('Location deleted successfully');
        bootstrap.Modal.getInstance(document.getElementById('deleteLocationModal'))?.hide();
        bootstrap.Modal.getInstance(document.getElementById('editLocationModal'))?.hide();
        this.loadLocations();
      },
      error: () => toastr.error('Failed to delete.')
    });
  }
}
