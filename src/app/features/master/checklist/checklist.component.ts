// src/app/features/master/checklist/checklist.component.ts
import { Component, OnInit } from '@angular/core';
import { ApiService } from '../../../core/services/api.service';
import { FormsModule } from '@angular/forms';
import { LayoutComponent } from 'src/app/shared/components/layout/layout.component';

declare var bootstrap: any;
declare var toastr: any;

@Component({
  standalone:true,
  imports:[FormsModule,LayoutComponent],
  selector: 'app-checklist',
  templateUrl: './checklist.component.html'
})
export class ChecklistComponent implements OnInit {
  checklists: any[] = [];
  searchText = '';
  isSubmitting = false;
  isEditMode = false;
  currentMasterId: any = null;
  viewItems: any[] = [];

  form = { trainingMode: '', trainingType: '', items: [] as any[] };

  constructor(private api: ApiService) {}

  ngOnInit(): void { this.load(); }

  get filteredList() {
    const s = this.searchText.toLowerCase();
    return this.checklists.filter(c =>
      (c.trainingMode || '').toLowerCase().includes(s) ||
      (c.trainingType || '').toLowerCase().includes(s)
    );
  }

  load(): void {
    this.api.get<any>('master/CheckList/getChecklist').subscribe(res => {
      this.checklists = res.data || [];
    });
  }

  openNewModal(): void {
    this.isEditMode = false;
    this.currentMasterId = null;
    this.form = { trainingMode: '', trainingType: '', items: [] };
    new bootstrap.Modal(document.getElementById('checklistModal')).show();
  }

  editChecklist(c: any): void {
    this.isEditMode = true;
    this.currentMasterId = c.id;
    this.form = {
      trainingMode: c.trainingMode,
      trainingType: c.trainingType,
      items: JSON.parse(JSON.stringify(c.hierarchy || []))
    };
    new bootstrap.Modal(document.getElementById('checklistModal')).show();
  }

  viewChecklist(c: any): void {
    this.viewItems = c.hierarchy || [];
    new bootstrap.Modal(document.getElementById('viewChecklistModal')).show();
  }

  addParent(): void {
    this.form.items.push({ name: '', sub: [] });
  }

  addChild(item: any): void {
    if (!item.sub) item.sub = [];
    item.sub.push({ name: '', sub: [] });
  }

  removeItem(arr: any[], i: number): void {
    arr.splice(i, 1);
  }

  saveChecklist(): void {
    if (!this.form.trainingMode || !this.form.trainingType) {
      toastr.warning('Please select Training Mode and Training Type.'); return;

    }
    if (!this.form.items.length) {
      toastr.warning('Please add at least one checklist item.'); return;
    }
    this.isSubmitting = true;

    if (this.isEditMode) {
      this.api.put<any>('master/CheckList/updateChecklist', {
        masterId: this.currentMasterId, checklistArray: this.form.items
      }).subscribe({
        next: () => { this.onSaveSuccess(); },
        error: () => { this.isSubmitting = false; toastr.error('Failed to update checklist.'); }
      });
    } else {
      this.api.post<any>('master/createChecklist', {
        trainingType: this.form.trainingType,
        trainingMode: this.form.trainingMode,
        checklistArray: this.form.items
      }).subscribe({
        next: () => { this.onSaveSuccess(); },
        error: err => {
          this.isSubmitting = false;
          toastr.error(err?.error?.message || 'Failed to create checklist.');
        }
      });
    }
  }

  private onSaveSuccess(): void {
    toastr.success(this.isEditMode ? 'Checklist updated successfully!' : 'Checklist created successfully!');
    this.isSubmitting = false;
    bootstrap.Modal.getInstance(document.getElementById('checklistModal'))?.hide();
    this.load();
  }
}
