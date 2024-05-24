import { Injectable } from '@angular/core';
import { UserService } from './user.service';
import { Router } from '@angular/router';
import { UtilityService } from './utility.service';

@Injectable({
  providedIn: 'root',
})
export class CourseService {
  constructor(
    private userService: UserService,
    private router: Router,
    private utilityService: UtilityService
  ) {}

  teacherAllCourses() {
    const id = this.userService.getUserData().id;
    const postObject = {
      selectors: ['courses.*', 'COUNT(lessons.ID) as  lessons'],
      tables: 'courses',
      conditions: {
        'LEFT JOIN lessons': 'ON lessons.CourseID = courses.ID',
        WHERE: {
          'courses.TeacherID': id,
        },
        'GROUP BY': 'courses.ID',
      },
    };

    return this.utilityService.post('get_entries', {
      data: JSON.stringify(postObject),
    });
  }

  getCourses(limit?: number, filter?: string) {
    const filterObject = filter != null ? { languageID: filter } : {};
    const limitObject = limit != null ? { LIMIT: limit } : {};
    const id = this.userService.getUserData().id;
    const postObject = {
      selectors: [
        'teachers.FirstName,teachers.LastName,teachers.Profile',
        'languages.*',
        'courses.*',
        'COUNT(lessons.ID) as lessoncount',
        'AVG(lessons.Difficulty) as complexity',
        'COUNT(student_classes.StudentID) as enrolled',
      ],
      tables: 'courses',
      conditions: Object.assign(
        {
          'LEFT JOIN teachers': 'ON teachers.ID = courses.TeacherID',
          'LEFT JOIN languages': 'ON languages.ID = courses.LanguageID',
          'LEFT JOIN lessons': 'ON lessons.CourseID = courses.ID',
          'LEFT JOIN classes': 'ON classes.CourseID = courses.ID',
          'LEFT JOIN student_classes':
            `ON student_classes.ClassID = classes.ID AND student_classes.StudentID ='` +
            id +
            `'`,
          WHERE: Object.assign(
            {
              'teachers.ID': 'courses.TeacherID',
            },
            filterObject
          ),
          'GROUP BY': 'courses.ID, teachers.ID, languages.ID',
          'ORDER BY': 'AVG(lessons.Difficulty) DESC',
        },
        limitObject
      ),
    };
    return this.utilityService.post('get_entries', {
      data: JSON.stringify(postObject),
    });
  }

  matchCourseCode(courseID: string, classCode: string) {
    const classCodeMatch = {
      '[dot]classes.ClassCode': classCode,
    };

    const postObject = {
      selectors: ['classes.*'],
      tables: 'classes, courses',
      conditions: {
        WHERE: Object.assign(classCodeMatch, {
          'classes.CourseID': 'courses.ID',
          'courses.ID': courseID,
        }),
      },
    };
    return this.utilityService.post('get_entries', {
      data: JSON.stringify(postObject),
    });
  }

  enrollCourse(classID: string) {
    const userData = JSON.parse(
      this.utilityService.usedStorage.getItem('user_info')!
    );
    const postObject = {
      tables: 'student_classes',
      values: {
        StudentID: userData.id,
        ClassID: classID,
        Pending: false,
      },
    };
    return this.utilityService.post('create_entry', {
      data: JSON.stringify(postObject),
    });
  }

  checkIfEnrolled(courseID: string) {
    const postObject = {
      CourseID: courseID,
      StudentID: this.userService.getUserData().id,
    };
    return this.utilityService.post('check_if_enrolled', postObject);
  }

  getLessons() {
    const id = this.userService.getUserData().id;
    const currentCourse = this.utilityService.usedStorage.getItem('courseID');
    if (currentCourse == null) {
      this.router.navigate(['/student/courses']);
    }
    const postObject = {
      selectors: [
        'teachers.FirstName',
        'teachers.LastName',
        'lessons.*, lessons_taken.Progress',
      ],
      tables: 'teachers,courses,lessons',
      conditions: {
        'LEFT JOIN lessons_taken': `ON lessons_taken.LessonID = lessons.ID AND lessons_taken.StudentID ='${id}'`,
        WHERE: {
          'courses.ID': currentCourse,
          'courses.TeacherID': 'teachers.ID',
          'lessons.CourseID': 'courses.ID',
        },
      },
    };
    return this.utilityService.post('get_entries', {
      data: JSON.stringify(postObject),
    });
  }

  lessonProgress(lessonID: string, progress: number) {
    const id = this.userService.getUserData().id;
    const postObject = {
      tables: 'lessons_taken',
      values: {
        LessonID: lessonID,
        StudentID: id,
        Progress: progress,
      },
    };
    return this.utilityService.post('create_entry', {
      data: JSON.stringify(postObject),
    });
  }

  getEnrolledCourses() {
    const userData = JSON.parse(
      this.utilityService.usedStorage.getItem('user_info')!
    );
    const postObject = {
      selectors: [
        'teachers.FirstName',
        'teachers.LastName',
        'classes.*',
        'classes.ID as class_id',
        'courses.*',
      ],
      tables: 'students,student_classes,classes,courses, teachers',
      conditions: {
        WHERE: {
          'teachers.ID': 'courses.TeacherID',
          'students.ID': 'student_classes.StudentID',
          'courses.ID': 'classes.CourseID',
          'student_classes.ClassID': 'classes.ID',
          ' students.ID': userData.id,
        },
      },
    };
    return this.utilityService.post('get_entries', {
      data: JSON.stringify(postObject),
    });
  }

  getCourseClasses() {
    const currentCourse = this.utilityService.usedStorage.getItem('courseID');
    const id = this.userService.getUserData().id;
    const postObject = {
      selectors: ['classes.*', 'courses.ID as course_id'],
      tables: 'classes,courses',
      conditions: {
        WHERE: {
          'classes.CourseID': 'courses.ID',
          'courses.TeacherID': id,
          'courses.ID': currentCourse,
        },
      },
    };
    return this.utilityService.post('get_entries', {
      data: JSON.stringify(postObject),
    });
  }

  teacherAllClasses() {
    const id = this.userService.getUserData().id;
    const postObject = {
      selectors: [
        'classes.*',
        'courses.ID as course_id',
        'courses.course',
        'COUNT(students.ID) as studentcount',
      ],
      tables: 'classes',
      conditions: {
        'LEFT JOIN student_classes': 'ON student_classes.ClassID = classes.ID',
        'LEFT JOIN courses': 'ON classes.CourseID = courses.ID',
        'LEFT JOIN students': 'ON student_classes.StudentID = students.ID',
        WHERE: {
          'courses.TeacherID': id,
        },
        'GROUP BY': 'classes.ID,courses.ID',
      },
    };
    return this.utilityService.post('get_entries', {
      data: JSON.stringify(postObject),
    });
  }

  teacherCoursesAndEnrolled() {
    const id = this.userService.getUserData().id;
    const postObject = {
      selectors: [
        'courses.*',
        'languages.Language',
        'COUNT(students.ID) as studentcount',
      ],
      tables: 'courses',
      conditions: {
        'LEFT JOIN languages': 'ON languages.ID = courses.LanguageID',
        'LEFT JOIN classes': 'ON classes.CourseID = courses.ID',
        'LEFT JOIN student_classes': 'ON student_classes.ClassID = classes.ID',
        'LEFT JOIN students': 'ON student_classes.StudentID = students.ID',
        WHERE: {
          'courses.TeacherID': id,
        },
        'GROUP BY': 'courses.ID,languages.ID',
      },
    };
    return this.utilityService.post('get_entries', {
      data: JSON.stringify(postObject),
    });
  }

  randomCourseCover(language: string) {
    var list: any = [];
    var folder: string = '';
    switch (language) {
      case 'english':
        list = [
          'english (1).jpg',
          'english (2).jpg',
          'english (3).jpg',
          'english (4).jpg',
          'english (5).jpg',
          'english (6).jpg',
          'english (7).jpg',
          'english (8).jpg',
        ];
        folder = 'english';
        break;
      case 'french':
        list = [
          'french (1).jpg',
          'french (2).jpg',
          'french (3).jpg',
          'french (4).jpg',
          'french (5).jpg',
        ];
        folder = 'french';
        break;
      case 'japanese':
        list = [
          'japanese (1).jpg',
          'japanese (4).jpg',
          'japanese (5).jpg',
          'japanese (6).jpg',
          'japanese (7).jpg',
          'japanese (8).jpg',
          'japanese (9).jpg',
        ];
        folder = 'japanese';
    }
    const random = Math.floor(Math.random() * list.length);
    return 'assets/coursecovers/' + folder + '/' + list[random];
  }

  async checkMaxRegistrations() {
    const postObject = {
      selectors: ['Value'],
      tables: 'admin_options',
      conditions: {
        WHERE: {
          Type: 'max_students',
        },
      },
    };
    const maxResponse = await this.utilityService
      .post('get_entries', {
        data: JSON.stringify(postObject),
      })
      .toPromise();
    const max = Number(maxResponse.output[0].value);

    const postObject2 = {
      selectors: ['COUNT(*) as value'],
      tables: 'students',
    };
    const countResponse = await this.utilityService
      .post('get_entries', {
        data: JSON.stringify(postObject2),
      })
      .toPromise();
    const count = Number(countResponse.output[0].value);

    return max > count;
  }

  getCourseProgress(courseID: string) {
    const id = this.userService.getUserData().id;
    const postObject = {
      selectors: [
        'SUM(lessons_taken.Progress)',
        'COUNT(lessons.ID) as lessons',
        'student_classes.*',
      ],
      tables: 'student_classes,classes,courses',
      conditions: {
        'LEFT JOIN lessons': 'ON lessons.CourseID = courses.ID',
        'LEFT JOIN lessons_taken': 'ON lessons_taken.LessonID = lessons.ID',
        WHERE: {
          'student_classes.StudentID': id,
          'student_classes.ClassID': 'classes.ID',
          'classes.CourseID': 'courses.ID',
          'courses.ID': courseID,
        },
        'GROUP BY': 'student_classes.ID, classes.ID, courses.ID',
      },
    };
    return this.utilityService.post('get_entries', {
      data: JSON.stringify(postObject),
    });
  }

  createCourse(
    courseID: string,
    title: string,
    description: string,
    mode: string,
    languageID: string
  ) {
    var _description = description;
    if (_description == '') {
      _description = '[NONE]';
    }
    const id = this.userService.getUserData().id;
    const postObject = {
      tables: 'courses',
      values: {
        ID: courseID,
        Course: title,
        Details: _description,
        Difficulty: 3,
        TeacherID: id,
        LanguageID: languageID,
        Filter: mode,
      },
    };
    return this.utilityService.post('create_entry', {
      data: JSON.stringify(postObject),
    });
  }

  updateCourse(
    courseID: string,
    title: string,
    description: string,
    mode: string,
    languageID: string
  ) {
    var _description = description;
    if (_description == '') {
      _description = '[NONE]';
    }
    const id = this.userService.getUserData().id;
    const postObject = {
      tables: 'courses',
      values: {
        Course: title,
        Details: _description,
        Difficulty: 3,
        TeacherID: id,
        LanguageID: languageID,
        Filter: mode,
      },
      conditions: {
        WHERE: {
          ID: courseID,
        },
      },
    };
    return this.utilityService.post('update_entry', {
      data: JSON.stringify(postObject),
    });
  }

  deleteCourse(courseID: string) {
    const postObject = {
      tables: 'courses',
      conditions: {
        WHERE: {
          ID: courseID,
        },
      },
    };
    return this.utilityService.post('delete_entry', {
      data: JSON.stringify(postObject),
    });
  }

  teacherGetCoursebyID(courseID: string) {
    const postObject = {
      selectors: ['courses.*'],
      tables: 'courses',
      conditions: {
        WHERE: {
          ID: courseID,
        },
      },
    };
    return this.utilityService.post('get_entries', {
      data: JSON.stringify(postObject),
    });
  }

  setCourse(courseID: string) {
    this.utilityService.usedStorage.setItem('courseID', courseID);
  }
}
