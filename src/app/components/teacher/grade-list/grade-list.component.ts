import { Component, OnInit } from '@angular/core';
import { APIService } from 'src/app/services/API/api.service';

interface Grade {
  studentName: string;
  grade: string;
}

interface AssignmentGrade {
  name: string;
  grades: Grade[];
}

interface QuizGrade {
  name: string;
  grades: Grade[];
}
@Component({
  selector: 'app-grade-list',
  templateUrl: './grade-list.component.html',
  styleUrls: ['./grade-list.component.css'],
})
export class GradeListComponent implements OnInit {
  constructor(private API: APIService) {}
  selectedQuiz: string = '';
  selectedTab: 'quizzes' | 'assignments' | 'attendanceHistory' | null = null;

  quizGrades: Map<string, QuizGrade> = new Map();
  labGrades: Map<string, QuizGrade> = new Map();
  assignmentGrades: Map<string, AssignmentGrade> = new Map();
  attendanceHistory: Map<string, any> = new Map();

  // [
  //   {
  //     name: 'Assignment 1',
  //     grades: [
  //       { studentName: 'Student A', grade: 'B' },
  //       { studentName: 'Student B', grade: 'A-' },
  //       // Add more grades for Assignment 1 here
  //     ],
  //   },
  //   // Add more assignments here
  // ];

  assignments: string[] = [];
  quizzes: string[] = [];
  labquizzes: string[] = [];
  selectedMeeting: string = '';

  ngOnInit(): void {
    this.API.showLoader();
    const obs$ = this.API.teacherGetAllSubmissions().subscribe((res) => {
      for (let assignment of res.output) {
        if (this.assignments.includes(assignment.assignmentid)) {
          this.assignmentGrades.get(assignment.assignmentid)?.grades.push({
            studentName: assignment.firstname + ' ' + assignment.lastname,
            grade: assignment.grade,
          });
        } else {
          this.assignments.push(assignment.assignmentid);
          this.assignmentGrades.set(assignment.assignmentid, {
            name: assignment.title,
            grades: [
              {
                studentName: assignment.firstname + ' ' + assignment.lastname,
                grade: assignment.grade,
              },
            ],
          });
        }
      }

      const obs2$ = this.API.teacherGetStudentQuizzes().subscribe((r) => {
        for (let quiz of r.output) {
          if (this.quizzes.includes(quiz.assessmentid)) {
            this.quizGrades.get(quiz.assessmentid)?.grades.push({
              studentName: quiz.firstname + ' ' + quiz.lastname,
              grade: quiz.takenpoints + ' / ' + quiz.totalpoints,
            });
          } else {
            this.quizzes.push(quiz.assessmentid);
            this.quizGrades.set(quiz.assessmentid, {
              name: quiz.title,
              grades: [
                {
                  studentName: quiz.firstname + ' ' + quiz.lastname,
                  grade: quiz.takenpoints + ' / ' + quiz.totalpoints,
                },
              ],
            });
          }
        }

        this.API.hideLoader();
        obs2$.unsubscribe();
      });
      const obs3$ = this.API.teacherGetLabQuizzes().subscribe((r) => {
        for (let quiz of r.output) {
          if (this.labquizzes.includes(`${quiz.lessonid}-${quiz.labid}`)) {
            this.labGrades.get(`${quiz.lessonid}-${quiz.labid}`)?.grades.push({
              studentName: quiz.firstname + ' ' + quiz.lastname,
              grade: quiz.takenpoints + ' / ' + quiz.totalpoints,
            });
          } else {
            this.labquizzes.push(`${quiz.lessonid}-${quiz.labid}`);
            this.labGrades.set(`${quiz.lessonid}-${quiz.labid}`, {
              name: `(${quiz.lab}) ${quiz.lesson}`,
              grades: [
                {
                  studentName: quiz.firstname + ' ' + quiz.lastname,
                  grade: quiz.takenpoints + ' / ' + quiz.totalpoints,
                },
              ],
            });
          }
        }
        obs3$.unsubscribe();
      });
      const obs4$ = this.API.getAttendanceHistory().subscribe((r) => {
        for (let meeting of r.output) {
          const meetingDateTime = meeting.datetime;
          const studentName = meeting.firstname + ' ' + meeting.lastname;
          if (this.attendanceHistory.has(meetingDateTime)) {
            this.attendanceHistory.get(meetingDateTime)?.push({
              student:studentName,
              time: meeting.timein
            });
          } else {
            this.attendanceHistory.set(meetingDateTime, [{
              student:studentName,
              time: meeting.timein
            }]);
          }
        }
        obs4$.unsubscribe();
      });
      obs$.unsubscribe();
    });
  }

  parseDateTime(time:string){
    return this.API.parseDateTime(time);
  }

  parseTime(time:string){
    return this.API.parseTime(time);
  }
  selectTab(tab: 'quizzes' | 'assignments' | 'attendanceHistory'): void {
    this.selectedTab = tab;
  }
}
