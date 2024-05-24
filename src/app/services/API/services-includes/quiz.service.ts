import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { UserService } from './user.service';
import { Observable } from 'rxjs';
import { UtilityService } from './utility.service';

@Injectable({
  providedIn: 'root',
})
export class QuizService {
  constructor(
    private http: HttpClient,
    private userService: UserService,
    private utilityService: UtilityService
  ) {}

  teacherGetQuizzes() {
    const id = this.userService.getUserData().id;
    const postObject = {
      selectors: ['assessments.*', 'COUNT(assessment_items.ID) as items'],
      tables: 'assessments',
      conditions: {
        'LEFT JOIN courses': 'ON assessments.CourseID = courses.ID',
        'LEFT JOIN assessment_items':
          'ON assessment_items.AssessmentID = assessments.ID',
        WHERE: {
          'courses.TeacherID': id,
        },
        'GROUP BY': 'assessments.ID',
      },
    };
    return this.utilityService.post('get_entries', {
      data: JSON.stringify(postObject),
    });
  }

  studentGetQuizzes() {
    const id = this.userService.getUserData().id;
    const postObject = {
      selectors: [
        'assessments.*',
        'courses.course',
        'languages.Language',
        'COUNT(student_assessments.ID) as done',
      ],
      tables: 'assessments',
      conditions: {
        'LEFT JOIN courses': 'ON assessments.CourseID = courses.ID',
        'LEFT JOIN languages': 'ON courses.LanguageID = languages.ID',
        'LEFT JOIN classes': 'ON classes.CourseID = courses.ID',
        'LEFT JOIN student_classes': 'ON student_classes.ClassID = classes.ID',
        'LEFT JOIN student_assessments': `ON student_assessments.StudentID = '${id}' AND student_assessments.AssessmentID = assessments.ID`,
        WHERE: {
          'student_classes.StudentID': id,
        },
        'GROUP BY':
          'assessments.ID, courses.ID, languages.ID,classes.ID, student_classes.ID',
      },
    };
    return this.utilityService.post('get_entries', {
      data: JSON.stringify(postObject),
    });
  }

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

  getQuizData(): Observable<any> {
    return this.http.get<any>('assets/jsons/speechlab/vidquiz/vidquiz.json');
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

  createQuiz(
    CourseID: string,
    ID: string,
    title: string,
    details: string,
    timelimit: number,
    deadline: string,
    attachments?: string,
    settings?: string
  ) {
    var attach = {};
    if (attachments != undefined) {
      attach = { Attachments: attachments };
    }

    var det = '[NONE]';
    if (details.trim() != '') {
      det = details;
    }

    var sett = {};
    if (settings != undefined) {
      sett = { Settings: settings };
    }

    const postObject = {
      tables: 'assessments',
      values: Object.assign(
        {},
        {
          CourseID: CourseID,
          ID: ID,
          Title: title,
          Details: det,
          Timelimit: timelimit,
          Deadline: deadline,
        },
        attach,
        sett
      ),
    };
    return this.utilityService.post('create_entry', {
      data: JSON.stringify(postObject),
    });
  }

  createQuizItem(
    QuizID: string,
    type: string,
    question: string,
    answer: string,
    options?: string
  ) {
    var opt = {};
    if (options != undefined) {
      opt = { Options: options };
    }
    const postObject = {
      tables: 'assessment_items',
      values: Object.assign(
        {},
        {
          AssessmentID: QuizID,
          Question: question,
          Type: type,
          Answer: answer,
        },
        opt
      ),
    };
    return this.utilityService.post('create_entry', {
      data: JSON.stringify(postObject),
    });
  }

  deleteQuiz(quizID: string) {
    const postObject = {
      tables: 'assessments',
      conditions: {
        WHERE: {
          ID: quizID,
        },
      },
    };
    return this.utilityService.post('delete_entry', {
      data: JSON.stringify(postObject),
    });
  }

  getQuizAverage(quizID: string) {
    const postObject = {
      selectors: ['(AVG(TakenPoints)/AVG(TotalPoints)) as average'],
      tables: 'student_assessments',
      conditions: {
        WHERE: {
          AssessmentID: quizID,
        },
        'GROUP BY': 'AssessmentID',
      },
    };

    return this.utilityService.post('get_entries', {
      data: JSON.stringify(postObject),
    });
  }

  recordAssessment(
    practiceID: string,
    level: number,
    takenPoints: number,
    totalPoints: number,
    mode: string
  ) {
    const postObject = {
      tables: 'student_practice_attempts',
      values: {
        StudentPracticeID: practiceID,
        Mode: mode,
        CurrentLevel: level,
        TakenPoints: takenPoints,
        TotalPoints: totalPoints,
      },
    };
    this.utilityService
      .post('create_entry', {
        data: JSON.stringify(postObject),
      })
      .subscribe();
  }

  recordQuiz(assessmentID: string, takenPoints: number, totalPoints: number) {
    const id = this.userService.getUserData().id;
    const postObject = {
      tables: 'student_assessments',
      values: {
        StudentID: id,
        AssessmentID: assessmentID,
        TakenPoints: takenPoints,
        TotalPoints: totalPoints,
      },
    };
    const record$ = this.utilityService
      .post('create_entry', {
        data: JSON.stringify(postObject),
      })
      .subscribe(() => {
        record$.unsubscribe();
      });
  }

  updateQuizScore(assessmentID: string, takenPoints: number) {
    const id = this.userService.getUserData().id;
    const postObject = {
      tables: 'student_assessments',
      values: {
        TakenPoints: takenPoints,
      },
      conditions: {
        WHERE: {
          StudentID: id,
          AssessmentID: assessmentID,
        },
      },
    };
    const update$ = this.utilityService
      .post('update_entry', {
        data: JSON.stringify(postObject),
      })
      .subscribe(() => {
        update$.unsubscribe();
      });
  }

  recordLabQuiz(lessonID: string, takenPoints: number, totalPoints: number) {
    const id = this.userService.getUserData().id;
    const postObject = {
      tables: 'speech_quizzes',
      values: {
        StudentID: id,
        LessonID: lessonID,
        TakenPoints: takenPoints,
        TotalPoints: totalPoints,
      },
    };
    const record$ = this.utilityService
      .post('create_entry', {
        data: JSON.stringify(postObject),
      })
      .subscribe(() => {
        record$.unsubscribe();
      });
  }

  searchStudentInQuiz(search: string, id: string) {
    const postObject = {
      selectors: [
        'students.ID, students.FirstName, students.LastName, students.LastSeen, students.VisibleID, students.Profile,TotalPoints, TakenPoints',
      ],
      tables: 'students, student_assessments',
      conditions: {
        WHERE: {
          'students.ID': 'student_assessments.StudentID',
          'student_assessments.AssessmentID': id,
        },
        "AND lower(concat(students.FirstName,' ',students.LastName))": `LIKE '%${search}%'`,
        'ORDER BY': `students.FirstName`,
      },
    };
    return this.utilityService.post('get_entries', {
      data: JSON.stringify(postObject),
    });
  }

  teacherGetStudentQuizzes() {
    const id = this.userService.getUserData().id;
    const postObject = {
      selectors: [
        'students.FirstName',
        'students.LastName',
        'assessments.title',
        'student_assessments.*',
      ],
      tables: 'students,student_assessments, assessments, courses',
      conditions: {
        WHERE: {
          'student_assessments.AssessmentID': 'assessments.ID',
          'student_assessments.StudentID': 'students.ID',
          'assessments.CourseID': 'courses.ID',
          'courses.TeacherID': id,
        },
      },
    };
    return this.utilityService.post('get_entries', {
      data: JSON.stringify(postObject),
    });
  }

  teacherGetLabQuizzes() {
    const postObject = {
      selectors: [
        'students.FirstName',
        'students.LastName',
        'speech_labs.Name as lab',
        'speech_lessons.Description as lesson',
        'speech_quizzes.*',
      ],
      tables:
        'students, speech_quizzes, speech_lessons, speech_lab_computers, speech_labs',
      conditions: {
        WHERE: {
          'speech_quizzes.LessonID': 'speech_lessons.ID',
          'speech_lab_computers.Address': 'students.VisibleID',
          'speech_labs.ID': 'speech_lab_computers.LabID',
          'students.ID': 'speech_quizzes.StudentID',
        },
      },
    };
    return this.utilityService.post('get_entries', {
      data: JSON.stringify(postObject),
    });
  }
}
