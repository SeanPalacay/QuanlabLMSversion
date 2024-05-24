import { Component, OnInit } from '@angular/core';
import { Router } from '@angular/router';
import { APIService } from 'src/app/services/API/api.service';

@Component({
  selector: 'app-quiz-analytics',
  templateUrl: './quiz-analytics.component.html',
  styleUrls: ['./quiz-analytics.component.css']
})
export class QuizAnalyticsComponent implements OnInit {
  students: any[] = [];
  selectedQuiz: any;

  dropdownOptions: string[] = ['Exam1', 'Exam2'];
  selectedOption: string = this.dropdownOptions[0]; 

  barChartData1: any[] = []; 
  lineChartData: any[] = []; 
  gradient: boolean = false;
  colorScheme: any = { domain: ['#5AA454', '#A10A28', '#C7B42C', '#AAAAAA'] }; 

  constructor(private router: Router, private API: APIService) { }

  ngOnInit(): void {
    this.selectedQuiz = history.state.quiz;
    if (this.selectedQuiz) {
      this.getQuizResults();
    } else {
      this.API.failedSnackbar('No quiz selected');
      this.navigateBack();
    }
  }

  getQuizResults(): void {
    this.API.showLoader();
    this.API.searchStudentInQuiz('', this.selectedQuiz.id).subscribe(data => {
      if (data.success) {
        this.students = data.output;
        this.initializeChartData();
        this.API.hideLoader();
      } else {
        this.API.failedSnackbar('Failed to load quiz results');
        this.API.hideLoader();
      }
    });
  }

  initializeChartData(): void {
    // Initialize data for the bar chart
    this.barChartData1 = this.students.map(student => ({
      name: student.firstname + ' ' + student.lastname,
      value: student.takenpoints 
    }));

    // Initialize data for the line chart
    this.lineChartData = [
      {
        name: this.selectedQuiz.title, 
        series: this.students.map(student => ({
          name: student.firstname + ' ' + student.lastname,
          value: student.takenpoints 
        }))
      }
    ];
  }

  navigateBack(): void {
    this.router.navigate(['teacher/quiz-management']);
  }
}