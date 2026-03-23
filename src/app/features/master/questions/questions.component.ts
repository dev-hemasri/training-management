// src/app/features/master/questions/questions.component.ts
import { Component, OnInit } from '@angular/core';
import { ApiService } from '../../../core/services/api.service';
import { FormsModule } from '@angular/forms';
import { LayoutComponent } from 'src/app/shared/components/layout/layout.component';

declare var bootstrap: any;
declare var toastr: any;

const QTYPE_MAP: Record<number, string> = {
  1: 'Short Text', 2: 'Long Text', 3: 'Contact No', 4: 'Email',
  5: 'Single Select', 6: 'Multiple Select', 7: 'Dropdown',
  8: 'Single Image', 9: 'Multiple Image', 10: 'Video', 11: 'Audio',
  12: 'Rating', 13: 'Ranking', 14: 'Feedback', 15: 'Matrix Ranking'
};

@Component({
  standalone:true,
  imports:[FormsModule,LayoutComponent],
  selector: 'app-questions',
  templateUrl: './questions.component.html'
})
export class QuestionsComponent implements OnInit {
  questions: any[] = [];
  searchText = '';
  isSubmitting = false;
  isEditMode = false;
  currentId: any = null;

  form = { quest: '', qtype: '', options: ['', ''] };

  constructor(private api: ApiService) {}

  ngOnInit(): void { this.load(); }

  get filteredList() {
    const s = this.searchText.toLowerCase();
    return this.questions.filter(q => q.quest.toLowerCase().includes(s));
  }

  get showOptions(): boolean {
    return ['5','6','7','13'].includes(this.form.qtype);
  }

  getQTypeName(t: number): string { return QTYPE_MAP[t] || ''; }

  load(): void {
    this.api.get<any>('quest').subscribe(res => { this.questions = res.data || []; });
  }

  openNewQuestionModal(): void {
    this.isEditMode = false;
    this.currentId = null;
    this.form = { quest: '', qtype: '', options: ['', ''] };
    new bootstrap.Modal(document.getElementById('questionModal')).show();
  }

  openEditQuestion(q: any): void {
    this.api.get<any>(`quest/detail/${q.id}`).subscribe(res => {
      const data = res.data;
      this.isEditMode = true;
      this.currentId = data.id;
      let opts = ['', ''];
      try { opts = JSON.parse(data.options) || ['', '']; } catch {}
      this.form = { quest: data.quest, qtype: String(data.qtype), options: Array.isArray(opts) ? opts : ['', ''] };
      new bootstrap.Modal(document.getElementById('questionModal')).show();
    });
  }

  onAnswerTypeChange(): void {
    if (!this.showOptions) this.form.options = ['', ''];
  }

  updatePreview(): void {}

  addOption(): void { this.form.options.push(''); }
  removeOption(): void { if (this.form.options.length > 2) this.form.options.pop(); }

  submitQuestion(): void {
    if (!this.form.quest || !this.form.qtype) { toastr.warning('Please fill all required fields'); return; }
    const opts = this.showOptions ? this.form.options : '';
    this.isSubmitting = true;

    const payload = { quest: this.form.quest, qtype: this.form.qtype, options: opts };

    const req = this.isEditMode
      ? this.api.put<any>(`quest/${this.currentId}`, payload)
      : this.api.post<any>('quest', payload);

    req.subscribe({
      next: res => {
        toastr.success(res.message);
        this.isSubmitting = false;
        bootstrap.Modal.getInstance(document.getElementById('questionModal'))?.hide();
        this.load();
      },
      error: () => { this.isSubmitting = false; toastr.error('Failed. Please try again.'); }
    });
  }

  confirmDeleteQuestion(): void {
    new bootstrap.Modal(document.getElementById('deleteQuestionModal')).show();
  }

  deleteQuestion(): void {
    this.api.put<any>(`quest/${this.currentId}`, { status: 'Deleted' }).subscribe({
      next: res => {
        toastr.success(res.message);
        bootstrap.Modal.getInstance(document.getElementById('deleteQuestionModal'))?.hide();
        bootstrap.Modal.getInstance(document.getElementById('questionModal'))?.hide();
        this.load();
      },
      error: () => toastr.error('Delete failed.')
    });
  }
}
