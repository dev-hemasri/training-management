// src/app/features/members/members.module.ts
import { NgModule } from '@angular/core';
import { RouterModule, Routes } from '@angular/router';
import { SharedModule } from '../../shared/shared.module';
import { MembersComponent } from './members.component';

const routes: Routes = [{ path: '', component: MembersComponent }];

@NgModule({
  declarations: [],
  imports: [SharedModule, RouterModule.forChild(routes),MembersComponent]
})
export class MembersModule {}
