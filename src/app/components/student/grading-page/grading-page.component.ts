// grading-page.component.ts
import { Component, OnInit } from '@angular/core';

@Component({
  selector: 'app-grading-page',
  templateUrl: './grading-page.component.html',
  styleUrls: ['./grading-page.component.css'],
})
export class GradingPageComponent implements OnInit {
  gradeForQuiz1: number = 85; // Replace with the actual grade for Quiz 1
  gradeForQuiz2: number = 92; // Replace with the actual grade for Quiz 2

  constructor() {}

  ngOnInit(): void {}
}
