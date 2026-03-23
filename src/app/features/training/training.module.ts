// src/app/features/training/training.module.ts
import { NgModule } from '@angular/core';
import { RouterModule, Routes } from '@angular/router';
import { SharedModule } from '../../shared/shared.module';
import { TrainingComponent } from './training.component';

const routes: Routes = [{ path: '', component: TrainingComponent }];

@NgModule({
  declarations: [],
  imports: [SharedModule, RouterModule.forChild(routes),TrainingComponent]
})
export class TrainingModule {}
