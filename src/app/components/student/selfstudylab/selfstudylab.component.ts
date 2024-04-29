import { Component } from '@angular/core';
import { Router } from '@angular/router';

@Component({
  selector: 'app-selfstudylab',
  templateUrl: './selfstudylab.component.html',
  styleUrls: ['./selfstudylab.component.css'],
})
export class SelfstudylabComponent {
  constructor(private router: Router) {}
  goToPractice(language: string) {
    this.router.navigate([
      'student/practice',
      { lang: language, mode: 'listening' },
    ]);
  }
  goBack(): void {
    this.router.navigate(['student/lab']);
  }
}
