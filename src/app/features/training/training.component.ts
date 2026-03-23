// src/app/features/training/training.component.ts
import { Component, OnInit } from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';
import { ApiService } from '../../core/services/api.service';
import { FormsModule } from '@angular/forms';
import { CommonModule } from '@angular/common';
import { LayoutComponent } from 'src/app/shared/components/layout/layout.component';

declare var toastr: any;
declare var bootstrap: any;

@Component({
  selector: 'app-training',
  template: `
  <app-layout pageTitle="Training">
    <!-- Tab Controls -->
    <div class="d-flex gap-2 mb-3">
      <button class="btn" [class.btn-primary]="activeTab==='upcoming'"
              [class.btn-outline-primary]="activeTab!=='upcoming'"
              (click)="setTab('upcoming')">Upcoming</button>
      <button class="btn" [class.btn-primary]="activeTab==='ongoing'"
              [class.btn-outline-primary]="activeTab!=='ongoing'"
              (click)="setTab('ongoing')">Ongoing</button>
      <button class="btn" [class.btn-primary]="activeTab==='completed'"
              [class.btn-outline-primary]="activeTab!=='completed'"
              (click)="setTab('completed')">Completed</button>
      <button class="btn btn-success ms-auto" (click)="openNewTraining()">
        <i class="fa fa-plus me-1"></i> New Training
      </button>
    </div>

    <!-- Search -->
    <div class="input-group mb-3" style="width:300px;">
      <span class="input-group-text bg-white border-end-0"><i class="fa fa-search text-muted"></i></span>
      <input type="text" class="form-control border-start-0 ps-0" placeholder="Search..." [(ngModel)]="searchText">
    </div>

    <!-- Training List Table -->
    <table class="table table-hover shadow">
      <thead class="table-dark">
        <tr>
          <th>Name</th><th>Type</th><th>Location</th>
          <th>Start</th><th>End</th><th>Status</th>
        </tr>
      </thead>
      <tbody>
        <tr *ngFor="let t of filteredList" (click)="goToDetails(t.id)" style="cursor:pointer;">
          <td>{{ t.name }}</td>
          <td>{{ t.type }}</td>
          <td>{{ t.locations }}</td>
          <td>{{ formatDate(t.t_start) }}</td>
          <td>{{ formatDate(t.t_end) }}</td>
          <td><span class="badge"
                [class.bg-success]="t.status==='Completed'"
                [class.bg-warning]="t.status==='Ongoing'"
                [class.bg-info]="t.status==='Upcoming'">{{ t.status }}</span></td>
        </tr>
        <tr *ngIf="filteredList.length === 0">
          <td colspan="6" class="text-center">No trainings found</td>
        </tr>
      </tbody>
    </table>
  </app-layout>
  `,
  standalone: true,                                                    // add this
  imports: [CommonModule, FormsModule, LayoutComponent],
})
export class TrainingComponent implements OnInit {
  trainings: any[] = [];
  searchText = '';
  activeTab = 'upcoming';

  constructor(
    private api: ApiService,
    private route: ActivatedRoute,
    private router: Router
  ) {}

  ngOnInit(): void {
    this.route.queryParams.subscribe(p => {
      if (p['tab']) this.activeTab = p['tab'];
      this.load();
    });
  }

  get filteredList() {
    const s = this.searchText.toLowerCase();
    return this.trainings.filter(t =>
      (t.name || '').toLowerCase().includes(s) ||
      (t.type || '').toLowerCase().includes(s)
    );
  }

  setTab(tab: string): void {
    this.activeTab = tab;
    this.load();
  }

  load(): void {
    const statusMap: any = { upcoming: 'Upcoming', ongoing: 'Ongoing', completed: 'Completed' };
    const status = statusMap[this.activeTab] || 'Upcoming';
    this.api.get<any>(`training?status=${status}`).subscribe(res => {
      this.trainings = res.data || [];
    });
  }

  formatDate(d: string): string {
    if (!d) return '-';
    const date = new Date(d);
    return `${date.getUTCDate()} ${['Jan','Feb','Mar','Apr','May','Jun','Jul','Aug','Sep','Oct','Nov','Dec'][date.getUTCMonth()]} ${date.getUTCFullYear()}`;
  }

  goToDetails(id: number): void {
    this.router.navigate(['/reports'], { queryParams: { training: id } });
  }

  openNewTraining(): void {
    this.router.navigate(['/forms']);
  }
}
