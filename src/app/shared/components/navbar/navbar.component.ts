// src/app/shared/components/navbar/navbar.component.ts
import { Component, Input, OnInit } from '@angular/core';
import { AuthService } from '../../../core/services/auth.service';

@Component({
  selector: 'app-navbar',
  templateUrl: './navbar.component.html'
})
export class NavbarComponent implements OnInit {
  @Input() pageTitle = 'Dashboard';
  userName = '';

  constructor(private authService: AuthService) {}

  ngOnInit(): void {
    this.userName = this.authService.getUserName();
  }

  logout(): void {
    this.authService.logout();
  }

  toggleMobileMenu(): void {
    const menu = document.getElementById('layout-menu');
    menu?.classList.toggle('active');
  }
}
