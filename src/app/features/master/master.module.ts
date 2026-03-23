// src/app/features/master/master.module.ts
import { NgModule } from '@angular/core';
import { RouterModule, Routes } from '@angular/router';
import { SharedModule } from '../../shared/shared.module';

import { TrainingTypeComponent } from './training-type/training-type.component';
import { TrainingLocationComponent } from './training-location/training-location.component';
import { AccommodationComponent } from './accommodation/accommodation.component';
import { QuestionsComponent } from './questions/questions.component';
import { UsersComponent } from './users/users.component';
import { ChecklistComponent } from './checklist/checklist.component';

const routes: Routes = [
  { path: '', redirectTo: 'training-type', pathMatch: 'full' },
  { path: 'training-type', component: TrainingTypeComponent },
  { path: 'training-location', component: TrainingLocationComponent },
  { path: 'accommodation', component: AccommodationComponent },
  { path: 'questions', component: QuestionsComponent },
  { path: 'users', component: UsersComponent },
  { path: 'checklist', component: ChecklistComponent }
];

@NgModule({
  declarations: [],
  imports: [SharedModule, RouterModule.forChild(routes),TrainingTypeComponent,
    TrainingLocationComponent,
    AccommodationComponent,
    QuestionsComponent,
    UsersComponent,
    ChecklistComponent]
})
export class MasterModule {}
