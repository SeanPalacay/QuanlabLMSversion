import { Component } from '@angular/core';
import { Router } from '@angular/router';

@Component({
  selector: 'app-quiz-analytics',
  templateUrl: './quiz-analytics.component.html',
  styleUrls: ['./quiz-analytics.component.css']
})
export class QuizAnalyticsComponent {
  students = [
    { name: 'Juan Delacruz', quiz1: 7, quiz2: 3 },
    { name: 'Kenneth De La Cruz', quiz1: 9, quiz2: 5 },
    { name: 'Jack Delacruz', quiz1: 6, quiz2: 1 },
    { name: 'John Delacruz', quiz1: 2, quiz2: 3 },
    { name: 'Ken De La Cruz', quiz1: 3, quiz2: 5 },
    { name: 'jan Delacruz', quiz1: 7, quiz2: 1 },
    { name: 'Mack Delacruz', quiz1: 1, quiz2: 3 },
    { name: 'me De La Cruz', quiz1: 5, quiz2: 5 },
    { name: 'sen Delacruz', quiz1: 2, quiz2: 1 },
    { name: 'pai Delacruz', quiz1: 4, quiz2: 3 },
    { name: 'acs De La Cruz', quiz1: 9, quiz2: 5 },
    { name: 'su Delacruz', quiz1: 6, quiz2: 1 },
    { name: 'b Delacruz', quiz1: 8, quiz2: 3 },
    { name: 's De La Cruz', quiz1: 7, quiz2: 5 },
    { name: 'h Delacruz', quiz1: 6, quiz2: 1 },
    { name: 'k Delacruz', quiz1: 3, quiz2: 3 },
    { name: 'e De La Cruz', quiz1: 5, quiz2: 5 },
    { name: 't Delacruz', quiz1: 1, quiz2: 1 }
  ];

  dropdownOptions: string[] = ['Quiz analytics 1', 'Quiz analytics 2'];
  selectedOption: string = this.dropdownOptions[0]; // Default selection

  barChartData1: any[] = []; // Initialize with an empty array
  lineChartData: any[] = []; // Initialize with an empty array
  gradient: boolean = false;
  colorScheme: any = { domain: ['#5AA454', '#A10A28', '#C7B42C', '#AAAAAA'] }; // Define colorScheme property

  constructor(private router: Router) { 
    this.initializeChartData();
  }

  initializeChartData(): void {
    // Initialize data for the bar chart  
    this.barChartData1 = this.students.map(student => ({
      name: student.name,
      value: student.quiz1  // Use quiz1 score for the bar chart
    }));

  // Initialize data for the line chart
  this.lineChartData = [
    {
      name: 'Quiz 1',
      series: this.students.map(student => ({
        name: student.name,
        value: student.quiz1 // Use quiz1 score for the line chart
      }))
    }
  ];
  }

  navigateBack(): void {
    this.router.navigate(['teacher/quiz-management']);
  }
}
