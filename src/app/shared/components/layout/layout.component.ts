// src/app/shared/components/layout/layout.component.ts
import { Component, Input } from '@angular/core';
import { SidebarComponent } from '../sidebar/sidebar.component';
import { NavbarComponent } from '../navbar/navbar.component';

@Component({
  standalone:true,
  imports:[SidebarComponent, NavbarComponent],
  selector: 'app-layout',
  templateUrl: './layout.component.html'
})
export class LayoutComponent {
  @Input() pageTitle = 'Dashboard';
}
