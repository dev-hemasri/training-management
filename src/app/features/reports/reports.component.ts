// src/app/features/reports/reports.component.ts
import { Component, OnInit } from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';
import { ApiService } from '../../core/services/api.service';
import { Chart, registerables } from 'chart.js';
import { FormsModule } from '@angular/forms';
import { LayoutComponent } from 'src/app/shared/components/layout/layout.component';

Chart.register(...registerables);
declare var ApexCharts: any;

@Component({
  standalone:true,
  imports:[FormsModule,LayoutComponent],
  selector: 'app-reports',
  templateUrl: './reports.component.html'
})
export class ReportsComponent implements OnInit {
  trainingId: any = null;
  trainings: any[] = [];
  searchText = '';
  isLoading = false;
  selectedTraining: any = null;
  reportData: any = null;
  attendHeaders: string[] = [];
  attendRows: any[][] = [];

  private charts: Chart[] = [];

  constructor(
    private api: ApiService,
    private route: ActivatedRoute,
    private router: Router
  ) {}

  ngOnInit(): void {
    this.loadAllTrainings();
    this.route.queryParams.subscribe(params => {
      if (params['training']) {
        this.trainingId = params['training'];
        this.loadReport(this.trainingId);
      }
    });
  }

  get filteredTrainings() {
    const s = this.searchText.toLowerCase();
    return this.trainings.filter(t =>
      (t.name || '').toLowerCase().includes(s) ||
      (t.type || '').toLowerCase().includes(s)
    );
  }

  loadAllTrainings(): void {
    this.api.get<any>('training?status=Completed').subscribe(res => {
      this.trainings = res.data || [];
    });
  }

  selectTraining(id: any): void {
    this.router.navigate([], { queryParams: { training: id }, queryParamsHandling: 'merge' });
  }

  clearTraining(): void {
    this.trainingId = null;
    this.reportData = null;
    this.selectedTraining = null;
    this.destroyCharts();
    this.router.navigate([], { queryParams: {} });
  }

  loadReport(id: any): void {
    this.isLoading = true;
    this.destroyCharts();

    this.api.get<any>(`training/detail/${id}`).subscribe({
      next: res => {
        this.reportData = res.data;
        this.isLoading = false;

        // Find training info
        const match = this.trainings.find(t => t.id == id);
        if (match) {
          this.selectedTraining = {
            ...match,
            locationName: (match.locations || '').split('-').pop()?.trim() || match.locations
          };
        } else {
          this.api.get<any>(`training?status=Completed`).subscribe(r => {
            const t = (r.data || []).find((x: any) => x.id == id);
            if (t) {
              this.selectedTraining = {
                ...t,
                locationName: (t.locations || '').split('-').pop()?.trim() || t.locations
              };
            }
          });
        }

        setTimeout(() => {
          this.drawPolarChart(res.data);
          this.loadSubjectChart(id);
          this.loadAttendanceChart(id);
          this.loadAssessmentChart(id);
          this.loadAttendanceTable(id);
        }, 300);
      },
      error: () => { this.isLoading = false; }
    });
  }

  drawPolarChart(data: any): void {
    const ctx = document.getElementById('polarChart') as HTMLCanvasElement;
    if (!ctx) return;

    const labels: string[] = [];
    const values: number[] = [];
    const colors: string[] = [];

    if (data.invited > 0) { labels.push('Invited'); values.push(data.invited); colors.push('#836AF9'); }
    if (data.rsvp > 0) { labels.push('Accepted'); values.push(data.rsvp); colors.push('#ffe800'); }
    if (data.certificate > 0) { labels.push('Certificate'); values.push(data.certificate); colors.push('#FF8132'); }

    if (!values.length) return;

    const chart = new Chart(ctx, {
      type: 'polarArea',
      data: {
        labels,
        datasets: [{ backgroundColor: colors, data: values, borderWidth: 1 }]
      },
      options: {
        responsive: true,
        maintainAspectRatio: false,
        plugins: {
          legend: { position: 'right', labels: { usePointStyle: true, padding: 20 } }
        }
      }
    });
    this.charts.push(chart);
  }

  loadSubjectChart(id: any): void {
    this.api.get<any>(`training/chart/${id}/participant-sbj`).subscribe(res => {
      const ctx = document.getElementById('barchartline') as HTMLCanvasElement;
      if (!ctx || !res.data?.length) return;

      const sorted = [...res.data].sort((a, b) => b.participants - a.participants);
      const top5 = sorted.slice(0, 5);
      const otherTotal = sorted.slice(5).reduce((s, i) => s + i.participants, 0);
      const labels = top5.map((i: any) => i.subject);
      const data = top5.map((i: any) => i.participants);
      if (otherTotal > 0) { labels.push('Others'); data.push(otherTotal); }

      const chart = new Chart(ctx, {
        type: 'bar',
        data: {
          labels,
          datasets: [{ label: 'Participants', data, backgroundColor: '#20c997', borderRadius: 5, barPercentage: 0.4 }]
        },
        options: {
          responsive: true, maintainAspectRatio: false,
          scales: {
            x: { grid: { display: false }, ticks: { maxRotation: 80, minRotation: 45 } },
            y: { beginAtZero: true }
          },
          plugins: { legend: { display: false } }
        }
      });
      this.charts.push(chart);
    });
  }

  loadAttendanceChart(id: any): void {
    this.api.get<any>(`training/chart/${id}/attendance`).subscribe(res => {
      const ctx = document.getElementById('barchartsec') as HTMLCanvasElement;
      if (!ctx || !res.data?.length) return;

      const labels = res.data.map((i: any) => i.session);
      const data = res.data.map((i: any) => i.participants);

      const chart = new Chart(ctx, {
        type: 'bar',
        data: {
          labels,
          datasets: [{ label: 'Participants', data, backgroundColor: '#00cfdd', borderRadius: 6, barPercentage: 0.3 }]
        },
        options: {
          indexAxis: 'y',
          responsive: true, maintainAspectRatio: false,
          scales: {
            x: { beginAtZero: true },
            y: { grid: { display: false } }
          },
          plugins: { legend: { display: false } }
        }
      });
      this.charts.push(chart);
    });
  }

  loadAssessmentChart(id: any): void {
    this.api.get<any>(`training/chart/${id}/assesment`).subscribe(res => {
      const el = document.querySelector('#lineChart');
      if (!el || typeof ApexCharts === 'undefined') return;

      const chartData = res.data || {};
      const categories: string[] = [];
      const preData: (number | null)[] = [];
      const postData: (number | null)[] = [];

      Object.values(chartData).forEach((item: any) => {
        categories.push('M' + item.id);
        preData.push(item.pre !== '' ? Number(item.pre) : null);
        postData.push(item.post !== '' ? Number(item.post) : null);
      });

      const options = {
        chart: { height: 250, type: 'line', toolbar: { show: false }, zoom: { enabled: false } },
        series: [
          { name: 'Pre Assessment', data: preData },
          { name: 'Post Assessment', data: postData }
        ],
        stroke: { curve: 'straight', width: 3 },
        markers: { size: 5 },
        colors: ['#03c3ec', '#fd7e14'],
        xaxis: { categories },
        tooltip: { y: { formatter: (val: number) => val + '%' } },
        legend: { position: 'top' }
      };

      try {
        const apexChart = new ApexCharts(el, options);
        apexChart.render();
      } catch (e) { console.warn('ApexCharts not available'); }
    });
  }

  loadAttendanceTable(id: any): void {
    this.api.get<any>(`training/participants/${id}?type=attendance`).subscribe({
      next: res => {
        const participants = res.data?.participants || [];
        if (!participants.length) return;

        // Build dynamic headers from first participant keys
        this.attendHeaders = ['Name', 'District', 'Subject', 'Score', 'Attendance'];
        this.attendRows = participants.map((p: any) => [
          p.name || '-', p.district || '-', p.subject || '-',
          p.score || '-', p.attendance || '-'
        ]);
      },
      error: () => {}
    });
  }

  destroyCharts(): void {
    this.charts.forEach(c => c.destroy());
    this.charts = [];
  }

  formatDate(d: string): string {
    if (!d) return '-';
    const months = ['Jan','Feb','Mar','Apr','May','Jun','Jul','Aug','Sep','Oct','Nov','Dec'];
    const date = new Date(d);
    return `${date.getUTCDate()} ${months[date.getUTCMonth()]} ${date.getUTCFullYear()}`;
  }
}
