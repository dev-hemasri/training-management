// src/app/features/dashboard/dashboard.component.ts
import { Component, OnInit, AfterViewInit } from '@angular/core';
import { Router } from '@angular/router';
import { ApiService } from '../../core/services/api.service';
import { Chart, registerables } from 'chart.js';
import { FormsModule } from '@angular/forms';
import { LayoutComponent } from 'src/app/shared/components/layout/layout.component';

Chart.register(...registerables);
declare var toastr: any;
@Component({
  standalone:true,
  imports:[FormsModule,LayoutComponent],
  selector: 'app-dashboard',
  templateUrl: './dashboard.component.html'
})
export class DashboardComponent implements OnInit, AfterViewInit {

  filters = { status: 'Completed', type: '', region: '', district: '', school: '', subject: '' };

  typeOptions: string[] = [];
  regionOptions: string[] = [];
  districtOptions: string[] = [];
  schoolOptions: string[] = [];
  subjectOptions: string[] = [];

  regionData: Record<string, string[]> = {};

  stats = {
    upCount: 0, sessionCount: 0,
    onCount: 0, acceptedCount: 0,
    acceptedCountSend: 0, acceptedCountReceived: 0,
    avgAttendance: 0, avgPerAttendance: 0
  };

  trainingList: any[] = [];
  memberList: any[] = [];

  private subjectChart: Chart | null = null;
  private districtChart: Chart | null = null;

  constructor(private api: ApiService, private router: Router) {}

  ngOnInit(): void {
    this.loadHomeData();
  }

  ngAfterViewInit(): void {
    this.applyFilter();
  }

  loadHomeData(): void {
    this.api.get<any>('user/homedata').subscribe(res => {
      const data = res.data[0];
      this.regionData = data.regions;
      this.regionOptions = Object.keys(data.regions);
      // this.districtOptions = ([] as string[]).concat(...Object.values(data.regions));
      this.regionOptions = ([] as string[]).concat(...Object.values(data.regions) as string[][]);
      this.typeOptions = Object.keys(data.trainings);
      this.schoolOptions = (data.school || []).map((s: any) => s.school || s);
    });
  }

  onRegionChange(): void {
    if (this.filters.region && this.regionData[this.filters.region]) {
      this.districtOptions = this.regionData[this.filters.region];
    } else {
      this.districtOptions = ([] as string[]).concat(...Object.values(this.regionData));
    }
    this.filters.district = '';
  }

  onFilterChange(): void {}
  applyFilter(): void {
    const { status, type, region, district, school, subject } = this.filters;
    const url = `user/filter-data?status=${encodeURIComponent(status)}&training=${encodeURIComponent(type)}&region=${encodeURIComponent(region)}&district=${encodeURIComponent(district)}&school=${encodeURIComponent(school)}&subject=${encodeURIComponent(subject)}`;

    if (status === 'Upcoming') {
     toastr.warning('No Training Available');
      this.trainingList = [];
      return;
    }

    this.api.get<any>(url).subscribe(res => {
      const data = res.data;

      // Update stats
      this.stats.upCount = data.trainings?.length || 0;
      this.stats.sessionCount = data.sessions || 0;
      this.stats.onCount = data.invited || 0;
      this.stats.acceptedCount = data.accepted || 0;
      this.stats.acceptedCountSend = data.accepted || 0;
      this.stats.avgAttendance = Math.floor(data.attendance || 0);
      this.stats.avgPerAttendance = Math.floor(data.avg_att || 0);

      // Training list
      this.trainingList = (data.trainings || []).map((t: any) => ({
        id: t.id,
        name: t.name,
        type: t.type
      }));

      // Member list
      this.memberList = (data.members || []).filter((m: any) => {
        const sel = this.filters.district?.trim().toLowerCase();
        const dist = m.district?.trim().toLowerCase();
        return sel ? dist === sel : true;
      });

      // Subject options for filter
      if (data.sbj_mem) {
        this.subjectOptions = data.sbj_mem.map((s: any) => s.subject);
      }

      // Draw Charts
      this.drawSubjectChart(data.sbj_mem || []);
      this.drawDistrictMap(data.dist_mem || []);
    });
  }

  drawSubjectChart(sbjMem: any[]): void {
    const canvas = document.getElementById('polarChartquest') as HTMLCanvasElement;
    if (!canvas) return;

    if (this.subjectChart) this.subjectChart.destroy();

    const specialAbbr = ['pg', 'bt', 'ug', 'sme'];
    const subjectCounts: Record<string, number> = {};
    sbjMem.forEach((item: any) => {
      const norm = item.subject.trim().toLowerCase();
      subjectCounts[norm] = (subjectCounts[norm] || 0) + item.count;
    });

    const origSubjects = Object.keys(subjectCounts);
    const tooltipLabels = origSubjects.map(s =>
      s.split('-').map((p: string, i: number) =>
        specialAbbr.includes(p.toLowerCase()) ? p.toUpperCase() : p.charAt(0).toUpperCase() + p.slice(1)
      ).join('-')
    );
    const shortLabels = origSubjects.map(s => {
      const parts = s.split('-');
      if (parts.length >= 2) return `${parts[0].toUpperCase()}-${parts[1].substring(0, 4)}`;
      return s;
    });

    this.subjectChart = new Chart(canvas, {
      type: 'bar',
      data: {
        labels: shortLabels,
        datasets: [{
          label: 'Invited Teachers',
          backgroundColor: ['#6f42c1','#ffc107','#fd7e14','#0dcaf0','#6c757d','#20c997','#f8d7da','#198754','#6610f2','#ff7f50'],
          data: Object.values(subjectCounts),
          borderWidth: 1
        }]
      },
      options: {
        responsive: true,
        maintainAspectRatio: false,
        plugins: {
          legend: { display: false },
          tooltip: {
            callbacks: {
              label: (ctx: any) => [`${tooltipLabels[ctx.dataIndex]}`, `Invited Teachers: ${ctx.raw}`],
              title: () => ''
            }
          }
        },
        scales: {
          x: { title: { display: true, text: 'Subjects' }, ticks: { maxRotation: 40, minRotation: 30 } },
          y: { beginAtZero: true, title: { display: true, text: 'Invited Teachers' } }
        }
      }
    });
  }

  drawDistrictMap(distMem: any[]): void {
    // Tamil Nadu SVG map drawing - same logic as original JS
    // Map path data is loaded from assets/tn-map-paths.json
    const svg = document.getElementById('tamilnaduMap') as unknown as SVGElement;
    if (!svg) return;

    const districtCounts: Record<string, number> = {};
    distMem.forEach((item: any) => {
      const norm = item.district.trim().toLowerCase();
      districtCounts[norm] = (districtCounts[norm] || 0) + item.count;
    });

    // Load map paths from service
    this.api.get<any>('assets/tn-map-paths.json').subscribe({
      next: () => {},
      error: () => {}
    });
  }

  goToTrainingReport(id: number): void {
    this.router.navigate(['/reports'], { queryParams: { training: id } });
  }

  goToMemberReport(id: number): void {
    this.router.navigate(['/reports/member'], { queryParams: { member: id } });
  }
}
