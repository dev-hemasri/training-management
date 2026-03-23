# TNGMS Training Management System - Angular Project

## Project Overview
This is the Angular conversion of the TNGMS Angular project.

## Tech Stack
- Angular 17+
- Bootstrap 5
- Chart.js
- DataTables
- Select2
- ApexCharts
- Google Maps API

## Folder Structure
```
src/
└── app/
    ├── core/
    │   ├── guards/         → AuthGuard
    │   ├── interceptors/   → AuthInterceptor
    │   └── services/       → ApiService, AuthService
    ├── shared/
    │   └── components/     → Sidebar, Navbar, Layout
    └── features/
        ├── auth/           → Login (index.html)
        ├── dashboard/      → Dashboard (dashboard.html)
        ├── master/
        │   ├── training-type/
        │   ├── training-location/
        │   ├── accommodation/
        │   ├── questions/
        │   ├── users/
        │   └── checklist/
        ├── training/       → training.html
        ├── members/        → members.html
        ├── forms/          → forms.html
        └── reports/        → reports.html
```

## Routes
| Route | Component | Original HTML |
|---|---|---|
| `/login` | LoginComponent | index.html |
| `/dashboard` | DashboardComponent | dashboard.html |
| `/master/training-type` | TrainingTypeComponent | master.html?training-type |
| `/master/training-location` | TrainingLocationComponent | master.html?training-location |
| `/master/accommodation` | AccommodationComponent | master.html?accommodation |
| `/master/questions` | QuestionsComponent | master.html?training-questions |
| `/master/users` | UsersComponent | master.html?users |
| `/master/checklist` | ChecklistComponent | master.html?checklist |
| `/training` | TrainingComponent | training.html |
| `/members` | MembersComponent | members.html |
| `/forms` | FormsComponent | forms.html |
| `/reports` | ReportsComponent | reports.html |

## Setup Instructions
```bash
npm install -g @angular/cli
ng new tngms-angular --routing --style=scss
cd tngms-angular
npm install bootstrap chart.js datatables.net select2 toastr
```
