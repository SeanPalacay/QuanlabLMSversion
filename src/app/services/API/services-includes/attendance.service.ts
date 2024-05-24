import { Injectable } from '@angular/core';
import { UserService } from './user.service';
import { MeetingService } from './meeting.service';
import { UtilityService } from './utility.service';

@Injectable({
  providedIn: 'root',
})
export class AttendanceService {
  currentLabLesson: string | boolean = false;

  constructor(
    private userService: UserService,
    private meetingService: MeetingService,
    private utilityService: UtilityService
  ) {}

  getAttendanceHistory() {
    const id = this.userService.getUserData().id;
    const postObject = {
      selectors: [
        'lab_meetings.ID',
        'lab_meetings.StartTime as datetime',
        'speech_attendance.TimeIn',
        'students.FirstName as firstname',
        'students.LastName as lastname',
      ],
      tables: 'lab_meetings, speech_attendance, students',
      conditions: {
        WHERE: {
          'lab_meetings.ID': 'speech_attendance.MeetingID',
          'lab_meetings.TeacherID': id,
          'students.ID': 'speech_attendance.StudentID',
        },
      },
    };
    return this.utilityService.post('get_entries', {
      data: JSON.stringify(postObject),
    });
  }

  checkStudentLabAttempt() {
    const id = this.userService.getUserData().id;
    const lessonID = this.currentLabLesson;
    const postObject = {
      selectors: [
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
          'speech_lessons.ID': lessonID,
          'students.ID ': id,
        },
      },
    };
    console.log(postObject);
    return this.utilityService.post('get_entries', {
      data: JSON.stringify(postObject),
    });
  }

  recordSpeechLabAttendance(id: string) {
    const postObject = {
      tables: 'speech_attendance',
      values: {
        StudentID: id,
        MeetingID: this.meetingService.sessionID,
      },
    };
    const res = this.utilityService
      .post('create_entry', {
        data: JSON.stringify(postObject),
      })
      .toPromise();
    return res;
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

  getStudentAssignedLab() {
    const id = this.userService.getUserData().visibleid;
    const postObject = {
      selectors: [
        'speech_labs.ID as labid, speech_labs.name as lab, speech_lab_computers.*',
      ],
      tables: 'speech_labs, speech_lab_computers',
      conditions: {
        WHERE: {
          'speech_lab_computers.Address': id,
        },
      },
    };
    return this.utilityService.post('get_entries', {
      data: JSON.stringify(postObject),
    });
  }
}
