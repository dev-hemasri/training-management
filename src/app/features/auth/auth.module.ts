// src/app/features/auth/auth.module.ts
import { NgModule } from '@angular/core';
import { RouterModule, Routes } from '@angular/router';
import { SharedModule } from '../../shared/shared.module';
import { LoginComponent } from './login/login.component';

const routes: Routes = [{ path: '', component: LoginComponent }];

@NgModule({
  declarations: [],
  imports: [SharedModule, RouterModule.forChild(routes),LoginComponent]
})
export class AuthModule {}
