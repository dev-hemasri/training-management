// src/app/features/reports/reports.module.ts
import { NgModule } from '@angular/core';
import { RouterModule, Routes } from '@angular/router';
import { SharedModule } from '../../shared/shared.module';
import { ReportsComponent } from './reports.component';
import { MemberReportComponent } from './member-report/member-report.component';

const routes: Routes = [
  { path: '', component: ReportsComponent },
  { path: 'member', component: MemberReportComponent }
];

@NgModule({
  declarations: [],
  imports: [SharedModule, RouterModule.forChild(routes),ReportsComponent, MemberReportComponent]
})
export class ReportsModule {}
