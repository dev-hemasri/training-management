// src/app/features/forms/forms.module.ts
import { NgModule } from '@angular/core';
import { RouterModule, Routes } from '@angular/router';
import { SharedModule } from '../../shared/shared.module';
import { FormsPageComponent } from './forms.component';

const routes: Routes = [{ path: '', component: FormsPageComponent }];

@NgModule({
  declarations: [],
  imports: [SharedModule, RouterModule.forChild(routes),FormsPageComponent]
})
export class FormModule {}
