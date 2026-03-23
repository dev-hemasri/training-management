// src/app/shared/shared.module.ts
import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule } from '@angular/router';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';
import { HttpClientModule } from '@angular/common/http';

import { SidebarComponent } from './components/sidebar/sidebar.component';
import { NavbarComponent } from './components/navbar/navbar.component';
import { LayoutComponent } from './components/layout/layout.component';

@NgModule({
  declarations: [],
  imports: [CommonModule, RouterModule, FormsModule, ReactiveFormsModule, HttpClientModule, SidebarComponent, NavbarComponent, LayoutComponent],
  exports: [
    CommonModule,
    RouterModule,
    FormsModule,
    ReactiveFormsModule,
    HttpClientModule,
    SidebarComponent,
    NavbarComponent,
    LayoutComponent
  ]
})
export class SharedModule {}
