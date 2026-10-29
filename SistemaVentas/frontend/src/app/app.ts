import { Component } from '@angular/core';
import { DashboardComponent } from './components/dashboard';

@Component({
  selector: 'app-root',
  standalone: true,
  imports: [DashboardComponent],
  templateUrl: './app.html',
  styleUrl: './app.css'
})
export class App {}