import { Injectable } from '@angular/core';
import { UserService } from './user.service';
import { UtilityService } from './utility.service';

@Injectable({
  providedIn: 'root',
})
export class GradingService {
  constructor(
    private userService: UserService,
    private utilityService: UtilityService
  ) {}

  teacherGradeTask(submissionID: string, grade: string, comment?: string) {
    const id = this.userService.getUserData().id;
    var _comment: any = {};
    if (comment) {
      _comment = {
        Feedback: comment,
      };
    }
    const postObject = {
      tables: 'student_assignments',
      values: Object.assign(
        {
          Grade: grade,
        },
        _comment
      ),
      conditions: {
        WHERE: {
          ID: submissionID,
        },
      },
    };
    return this.utilityService.post('update_entry', {
      data: JSON.stringify(postObject),
    });
  }

  studentQuizPoints() {
    const id = this.userService.getUserData().id;
    const postObject = {
      selectors: ['student_assessments.*'],
      tables: 'student_assessments',
      conditions: {
        WHERE: {
          'student_assessments.StudentID': id,
        },
      },
    };
    return this.utilityService.post('get_entries', {
      data: JSON.stringify(postObject),
    });
  }

  studentGetQuiz(taskID: string) {
    const id = this.userService.getUserData().id;
    const postObject = {
      selectors: [
        'assessments.*',
        'assessment_items.*',
        'teachers.ID as teacherid',
      ],
      tables:
        'assessments,assessment_items,courses, classes,teachers ,student_classes',
      conditions: {
        WHERE: {
          'courses.TeacherID': 'teachers.ID',
          'courses.ID': 'assessments.CourseID',
          'assessment_items.AssessmentID': 'assessments.ID',
          'assessments.ID': taskID,
          'classes.CourseID': 'courses.ID',
          'student_classes.ClassID': 'classes.ID',
          'student_classes.StudentID': id,
        },
      },
    };
    return this.utilityService.post('get_entries', {
      data: JSON.stringify(postObject),
    });
  }
}
