// src/app/features/reports/member-report/member-report.component.ts
import { Component, OnInit } from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';
import { ApiService } from '../../../core/services/api.service';
import { LayoutComponent } from 'src/app/shared/components/layout/layout.component';

@Component({
  selector: 'app-member-report',
  template: `
  <app-layout pageTitle="Member Report">
    <button class="btn btn-outline-secondary btn-sm mb-3" (click)="goBack()">
      <i class="fa fa-arrow-left me-1"></i> Back
    </button>

    <div *ngIf="isLoading" class="text-center py-5">
      <div class="spinner-border text-primary"></div>
    </div>

    <div *ngIf="member && !isLoading">
      <!-- Member Info Card -->
      <div class="card mb-4">
        <div class="card-body">
          <div class="row">
            <div class="col-md-6">
              <h4 class="fw-bold text-dark">{{ member.name }}</h4>
              <p class="mb-1"><strong>Staff ID:</strong> {{ member.staff_id || '-' }}</p>
              <p class="mb-1"><strong>District:</strong> {{ member.district || '-' }}</p>
              <p class="mb-1"><strong>Subject:</strong> {{ member.subject || '-' }}</p>
            </div>
            <div class="col-md-6">
              <p class="mb-1"><strong>Mobile:</strong> {{ member.mobile || '-' }}</p>
              <p class="mb-1"><strong>Email:</strong> {{ member.email || '-' }}</p>
              <p class="mb-1"><strong>School:</strong> {{ member.school || '-' }}</p>
              <p class="mb-1"><strong>Designation:</strong> {{ member.designation || '-' }}</p>
            </div>
          </div>
        </div>
      </div>

      <!-- Training History -->
      <h5 class="mb-3">Training History</h5>
      <table class="table table-hover shadow">
        <thead class="table-dark">
          <tr>
            <th>Training Name</th><th>Type</th><th>Location</th>
            <th>Start</th><th>End</th><th>Attendance</th><th>Score</th>
          </tr>
        </thead>
        <tbody>
          <tr *ngFor="let t of trainings">
            <td>{{ t.name || '-' }}</td>
            <td>{{ t.type || '-' }}</td>
            <td>{{ t.locations || '-' }}</td>
            <td>{{ formatDate(t.t_start) }}</td>
            <td>{{ formatDate(t.t_end) }}</td>
            <td>
              <span class="badge" [class.bg-success]="t.attendance" [class.bg-danger]="!t.attendance">
                {{ t.attendance ? 'Present' : 'Absent' }}
              </span>
            </td>
            <td>{{ t.score || '-' }}</td>
          </tr>
          <tr *ngIf="trainings.length === 0">
            <td colspan="7" class="text-center text-muted py-4">No training history</td>
          </tr>
        </tbody>
      </table>
    </div>

    <div *ngIf="!member && !isLoading" class="text-center py-5 text-muted">
      Member not found.
    </div>
  </app-layout>
  `,
  imports:[LayoutComponent]
})
export class MemberReportComponent implements OnInit {
  member: any = null;
  trainings: any[] = [];
  isLoading = false;

  constructor(
    private api: ApiService,
    private route: ActivatedRoute,
    private router: Router
  ) {}

  ngOnInit(): void {
    this.route.queryParams.subscribe(params => {
      if (params['member']) this.load(params['member']);
    });
  }

  load(id: any): void {
    this.isLoading = true;
    this.api.get<any>(`user/member/${id}`).subscribe({
      next: res => {
        this.member = res.data || null;
        this.trainings = res.data?.trainings || [];
        this.isLoading = false;
      },
      error: () => { this.isLoading = false; }
    });
  }

  formatDate(d: string): string {
    if (!d) return '-';
    const months = ['Jan','Feb','Mar','Apr','May','Jun','Jul','Aug','Sep','Oct','Nov','Dec'];
    const date = new Date(d);
    return `${date.getUTCDate()} ${months[date.getUTCMonth()]} ${date.getUTCFullYear()}`;
  }

  goBack(): void {
    this.router.navigate(['/reports']);
  }
}
