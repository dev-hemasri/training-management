// src/app/features/master/training-type/training-type.component.ts
import { Component, OnInit, TRANSLATIONS } from '@angular/core';
import { ApiService } from '../../../core/services/api.service';
import { LayoutComponent } from 'src/app/shared/components/layout/layout.component';
import { FormsModule } from '@angular/forms';

declare var bootstrap: any;
declare var toastr: any;

@Component({
  standalone:true,
  imports:[FormsModule,LayoutComponent],
  selector: 'app-training-type',
  templateUrl: './training-type.component.html'
})
export class TrainingTypeComponent implements OnInit {
  trainingTypes: any[] = [];
  searchText = '';
  isSubmitting = false;

  newType = { name: '', detail: [''] };
  editType = { id: null, name: '', detail: [''] };

  constructor(private api: ApiService) {}

  ngOnInit(): void {
    this.loadTrainingTypes();
  }

  get filteredList() {
    const s = this.searchText.toLowerCase();
    return this.trainingTypes.filter(t =>
      t.name.toLowerCase().includes(s) ||
      (t.detail || []).some((d: string) => d.toLowerCase().includes(s))
    );
  }

  loadTrainingTypes(): void {
    this.api.get<any>('master/training').subscribe(res => {
      this.trainingTypes = res.data || [];
    });
  }

  openNewModal(): void {
    this.newType = { name: '', detail: [''] };
    const modal = new bootstrap.Modal(document.getElementById('newTypeModal'));
    modal.show();
  }

  openEditModal(item: any): void {
    this.editType = { id: item.id, name: item.name, detail: [...(item.detail || [''])] };
    const modal = new bootstrap.Modal(document.getElementById('editTypeModal'));
    modal.show();
  }

  addTypeField(): void {
    this.newType.detail.push('');
  }

  addEditTypeField(): void {
    this.editType.detail.push('');
  }

  removeEditTypeField(i: number): void {
    this.editType.detail.splice(i, 1);
  }

  submitNewType(): void {
    if (!this.newType.name.trim()) { toastr.warning('Please fill all the fields!'); return; }
    const validDetail = this.newType.detail.filter(d => d.trim());
    if (!validDetail.length) { toastr.warning('Please fill all the fields!'); return; }

    this.isSubmitting = true;
    this.api.post<any>('master/training', { name: this.newType.name, detail: validDetail })
      .subscribe({
        next: res => {
          toastr.success('Successfully Submitted');
          this.isSubmitting = false;
          bootstrap.Modal.getInstance(document.getElementById('newTypeModal'))?.hide();
          this.loadTrainingTypes();
        },
        error: () => { this.isSubmitting = false; toastr.warning('Please try again!'); }
      });
  }

  updateType(): void {
    if (!this.editType.name.trim()) { toastr.warning('Please enter name'); return; }
    const validDetail = this.editType.detail.filter(d => d.trim());
    if (!validDetail.length) { toastr.warning('Please fill detail fields'); return; }

    this.isSubmitting = true;
    this.api.put<any>(`master/training/${this.editType.id}`, {
      status: 'Active', name: this.editType.name, detail: validDetail
    }).subscribe({
      next: () => {
        toastr.success('Successfully Updated');
        this.isSubmitting = false;
        bootstrap.Modal.getInstance(document.getElementById('editTypeModal'))?.hide();
        this.loadTrainingTypes();
      },
      error: () => { this.isSubmitting = false; toastr.error('Update failed.'); }
    });
  }

  confirmDelete(): void {
    const deleteModal = new bootstrap.Modal(document.getElementById('deleteTypeModal'));
    deleteModal.show();
  }

  deleteType(): void {
    this.api.put<any>(`master/training/${this.editType.id}`, { status: 'Deleted' })
      .subscribe({
        next: res => {
          toastr.success(res.message);
          bootstrap.Modal.getInstance(document.getElementById('deleteTypeModal'))?.hide();
          bootstrap.Modal.getInstance(document.getElementById('editTypeModal'))?.hide();
          this.loadTrainingTypes();
        },
        error: () => toastr.error('Delete failed.')
      });
  }
}
