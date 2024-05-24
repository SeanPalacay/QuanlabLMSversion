import { Injectable } from '@angular/core';
import { UserService } from './user.service';
import { UtilityService } from './utility.service';
import { Observable } from 'rxjs';

@Injectable({
  providedIn: 'root',
})
export class ClassService {
  constructor(
    private userService: UserService,
    private utilityService: UtilityService
  ) {}

  createClass(
    courseID: string,
    className: string,
    code: string,
    schedule: string
  ) {
    const postObject = {
      tables: 'classes',
      values: {
        CourseID: courseID,
        Class: className,
        ClassCode: code,
        Schedule: schedule,
      },
    };
    return this.utilityService.post('create_entry', {
      data: JSON.stringify(postObject),
    });
  }

  editClass(
    classID: string,
    className: string,
    code: string,
    schedule: string
  ) {
    const postObject = {
      tables: 'classes',
      values: {
        Class: className,
        ClassCode: code,
        Schedule: schedule,
      },
      conditions: {
        WHERE: {
          ID: classID,
        },
      },
    };
    return this.utilityService.post('update_entry', {
      data: JSON.stringify(postObject),
    });
  }

  deleteClass(classID: string) {
    const postObject = {
      tables: 'classes',
      conditions: {
        WHERE: {
          ID: classID,
        },
      },
    };
    return this.utilityService.post('delete_entry', {
      data: JSON.stringify(postObject),
    });
  }

  getStudentsInClass(classID: string) {
    const postObject = {
      selectors: [
        'students.FirstName',
        'students.LastName',
        'students.ID as student_id',
      ],
      tables: 'classes,student_classes,students',
      conditions: {
        WHERE: {
          'classes.ID': classID,
          'student_classes.ClassID': 'classes.ID',
          'students.ID': 'student_classes.StudentID',
          'student_classes.Pending': false,
        },
      },
    };
    return this.utilityService.post('get_entries', {
      data: JSON.stringify(postObject),
    });
  }

  getStudents() {
    const postObject = {
      selectors: [
        'students.ID',
        'students.FirstName',
        'students.LastName',
        'students.gender',
        'students.birthdate',
        'students.nationality',
        'students.address',
        'students.VisibleID',
        'students.Email',
        'students.profile',
        'students.lastseen',
      ],
      tables: 'students',
    };
    return this.utilityService.post('get_entries', {
      data: JSON.stringify(postObject),
    });
  }

  getStudentsTeacher() {
    const postObject = {
      selectors: [
        'students.ID',
        'students.FirstName',
        'students.LastName',
        'students.gender',
        'students.birthdate',
        'students.nationality',
        'students.address',
        'students.VisibleID',
        'students.Email',
        'students.profile',
        'students.lastseen',
        'courses.course',
        'classes.class',
        'classes.id AS class_id',
      ],
      tables: 'students,student_classes,classes,courses',
      conditions: {
        WHERE: {
          'student_classes.StudentID': 'students.ID',
          'student_classes.ClassID': 'classes.ID',
          'classes.CourseID': 'courses.ID',
          'courses.teacherID': this.userService.getUserData().id,
        },
      },
    };
    return this.utilityService.post('get_entries', {
      data: JSON.stringify(postObject),
    });
  }

  deleteStudentFromCourse(classID: string, studentID: string) {
    const postObject = {
      tables: 'student_classes',
      conditions: {
        WHERE: {
          ClassID: classID,
          StudentID: studentID,
        },
      },
    };
    console.log('ken', postObject);
    return this.utilityService.post('delete_entry', {
      data: JSON.stringify(postObject),
    });
  }

  updateStudentInfoFromTeacher(
    id: string,
    firstname: string,
    lastname: string
  ) {
    const postObject = {
      tables: 'students',
      values: {
        FirstName: firstname,
        LastName: lastname,
      },
      conditions: {
        WHERE: {
          ID: id,
        },
      },
    };

    console.log('ken', postObject);
    return this.utilityService.post('update_entry', {
      data: JSON.stringify(postObject),
    });
  }

  getClasses() {
    if (this.userService.getUserType() == '1') {
      const id = this.userService.getUserData().id;
      const postObject = {
        selectors: ['courses.*,classes.*'],
        tables: 'classes,courses',
        conditions: {
          WHERE: {
            'classes.CourseID': 'courses.ID',
            'courses.TeacherID': id,
          },
        },
      };
      return this.utilityService.post('get_entries', {
        data: JSON.stringify(postObject),
      });
    } else {
      const id = this.userService.getUserData().id;
      const postObject = {
        selectors: [' courses.*, classes.*'],
        tables: 'classes,student_classes, courses',
        conditions: {
          WHERE: {
            'classes.CourseID': 'courses.ID',
            'classes.ID': 'student_classes.ClassID',
            'student_classes.StudentID': id,
          },
        },
      };
      return this.utilityService.post('get_entries', {
        data: JSON.stringify(postObject),
      });
    }
  }

  teacherGetClassesByCourse(courseID: string) {
    const postObject = {
      selectors: ['classes.*'],
      tables: 'classes',
      conditions: {
        WHERE: {
          'classes.CourseID': courseID,
        },
      },
    };
    return this.utilityService.post('get_entries', {
      data: JSON.stringify(postObject),
    });
  }

  teacherCourseLessons(courseID: string) {
    const postObject = {
      selectors: [
        'courses.id as cid',
        'courses.Course',
        'courses.Details',
        'lessons.*',
      ],
      tables: 'courses,lessons',
      conditions: {
        WHERE: {
          'courses.ID': courseID,
          'lessons.CourseID': 'courses.ID',
        },
      },
    };
    return this.utilityService.post('get_entries', {
      data: JSON.stringify(postObject),
    });
  }

  createTask(
    courseID: string,
    title: string,
    description: string,
    deadline: string,
    attachments?: string
  ): Observable<any> {
    var attach = {};
    if (attachments != undefined) {
      attach = { Attachments: attachments };
    }

    const postObject = {
      tables: 'assignments',
      values: Object.assign(
        {},
        {
          CourseID: courseID,
          Title: title,
          Details: description,
          Deadline: deadline,
        },
        attach
      ),
    };
    return this.utilityService.post('create_entry', {
      data: JSON.stringify(postObject),
    });
  }
}
