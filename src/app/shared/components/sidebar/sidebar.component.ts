// src/app/shared/components/sidebar/sidebar.component.ts
import { Component, OnInit } from '@angular/core';
import { Router, NavigationEnd } from '@angular/router';
import { filter } from 'rxjs/operators';

@Component({
  selector: 'app-sidebar',
  templateUrl: './sidebar.component.html'
})
export class SidebarComponent implements OnInit {
  masterOpen = false;
  isSuperAdmin = false;

  constructor(private router: Router) {}

  ngOnInit(): void {
    this.isSuperAdmin = localStorage.getItem('trole') === 'Super Admin';

    // Auto-expand Master menu if on a master route
    this.router.events
      .pipe(filter(e => e instanceof NavigationEnd))
      .subscribe((e: any) => {
        this.masterOpen = e.url.startsWith('/master');
      });

    this.masterOpen = this.router.url.startsWith('/master');
  }
}
