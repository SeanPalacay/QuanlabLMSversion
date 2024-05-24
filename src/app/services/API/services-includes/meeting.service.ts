import { Injectable } from '@angular/core';
import { UserService } from './user.service';
import { FileService } from './file.service';
import { BehaviorSubject, Subscription, firstValueFrom, map } from 'rxjs';
import { HttpClient, HttpHeaders } from '@angular/common/http';
import { environment } from 'src/environments/environment';
import { VideoSDK } from '@videosdk.live/js-sdk';
import { UtilityService } from './utility.service';
import { MessageObject, ParticipantObject } from 'src/app/shared/model/models';
import { Router } from '@angular/router';
import { MessagingService } from './messaging.service';

@Injectable({
  providedIn: 'root',
})
export class MeetingService {
  participantsAudio: Map<string, ParticipantObject> = new Map();
  labNotifiier = new BehaviorSubject<any>(null);
  audio: HTMLAudioElement;
  meeting: any;
  meetingID?: string;
  labID?: string;
  isMicOn = false;
  micLoading = false;
  sessionID?: string;

  constructor(
    private http: HttpClient,
    private userService: UserService,
    private fileService: FileService,
    private utilityService: UtilityService,
    private router: Router,
    private messagingService: MessagingService
  ) {
    this.audio = new Audio();
    this.audio.src = 'assets/sounds/notif.mp3';
    this.audio.load();
  }

  async initSpeechMeeting() {
    VideoSDK.config(environment.token);
    this.meeting = VideoSDK.initMeeting({
      meetingId: this.meetingID!,
      participantId: this.userService.getUserData().visibleid,
      name: this.userService.getFullName(),
      metaData: {
        who: this.userService.getUserType(),
        id: this.userService.getUserData().id,
      },
      micEnabled: this.userService.getUserType() == '0',
      webcamEnabled: false,
    });
  }

  startMeeting(uniqID: string, teacherID: string, meetingCode: string) {
    var classID = this.fileService.usedStorage.getItem('classID');
    const postObject = {
      tables: 'meetings',
      values: {
        ID: uniqID,
        ClassID: classID,
        TeacherID: teacherID,
        MeetingCode: meetingCode,
      },
    };
    return this.utilityService.post('create_entry', {
      data: JSON.stringify(postObject),
    });
  }

  updateParticipantCount(sessionID: string, participants: number) {
    const postObject = {
      tables: 'meetings',
      values: {
        Participants: participants,
      },
      conditions: {
        WHERE: {
          ID: sessionID,
        },
      },
    };
    const observable$: Subscription = this.utilityService
      .post('update_entry', {
        data: JSON.stringify(postObject),
      })
      .subscribe(() => observable$.unsubscribe());
  }

  loadMeetingSessions() {
    const month = new Date().getMonth();
    const postObject = {
      selectors: [
        'classes.Class,meetings.*, teachers.FirstName, teachers.LastName',
      ],
      tables: 'meetings, teachers, classes',
      conditions: {
        WHERE: {
          'meetings.TeacherID': 'teachers.ID',
          'meetings.ClassID': 'classes.ID',
          'EXTRACT(MONTH FROM meetings.StartTime)': month + 1,
        },
      },
    };
    return this.utilityService.post('get_entries', {
      data: JSON.stringify(postObject),
    });
  }

  getMeeting(studentID: string) {
    const classID = this.fileService.usedStorage.getItem('classID');

    const postObject = {
      selectors: ['meetings.*,courses.*'],
      tables: 'meetings, student_classes,classes,courses',
      conditions: {
        WHERE: {
          'courses.ID': 'classes.CourseID',
          'classes.ID': 'meetings.ClassID',
          'student_classes.ClassID': 'meetings.ClassID',
          'meetings.ClassID': classID,
          'student_classes.StudentID': studentID,
        },
        AND: 'meetings.EndTime IS NULL',
      },
    };
    return this.utilityService.post('get_entries', {
      data: JSON.stringify(postObject),
    });
  }

  endMeeting(teacherID: string) {
    return this.utilityService.post('end_meeting', {
      TeacherID: teacherID,
    });
  }

  startSpeechMeeting(
    uniqID: string,
    teacherID: string,
    meetingCode: string,
    lab: string
  ) {
    const postObject = {
      tables: 'lab_meetings',
      values: {
        ID: uniqID,
        LabID: lab,
        TeacherID: teacherID,
        MeetingCode: meetingCode,
      },
    };
    return this.utilityService.post('create_entry', {
      data: JSON.stringify(postObject),
    });
  }

  getOpenLabMeeting(lab: string) {
    const postObject = {
      selectors: [
        'lab_meetings.*, teachers.Firstname, teachers.LastName,  speech_labs.Name as lab',
      ],
      tables: 'lab_meetings, teachers, speech_labs',
      conditions: {
        WHERE: {
          'speech_labs.ID': 'lab_meetings.LabID',
          'lab_meetings.LabID': lab,
          'teachers.ID': 'lab_meetings.teacherid',
        },
        AND: 'lab_meetings.EndTime IS NULL',
      },
    };
    return this.utilityService.post('get_entries', {
      data: JSON.stringify(postObject),
    });
  }

  getSpeechMeeting(studentID: string, lab: string) {
    const postObject = {
      selectors: ['lab_meetings.*'],
      tables: 'lab_meetings, speech_lab_computers, students',
      conditions: {
        WHERE: {
          'lab_meetings.LabID': 'speech_lab_computers.LabID',
          ' lab_meetings.LabID': lab,
          'speech_lab_computers.Address': 'students.VisibleID',
          'students.ID': studentID,
        },
        AND: 'lab_meetings.EndTime IS NULL',
      },
    };
    return this.utilityService.post('get_entries', {
      data: JSON.stringify(postObject),
    });
  }

  getTeacherMeeting() {
    const postObject = {
      selectors: ['lab_meetings.*'],
      tables: 'lab_meetings',
      conditions: {
        WHERE: {
          'lab_meetings.TeacherID': this.userService.getUserData().id,
        },
        AND: 'lab_meetings.EndTime IS NULL',
      },
    };
    return this.utilityService.post('get_entries', {
      data: JSON.stringify(postObject),
    });
  }

  startLab(lab: string) {
    if (this.userService.getUserType() == '0') {
      const obs = this.getSpeechMeeting(
        this.userService.getUserData().id,
        lab
      ).subscribe((data) => {
        if (data.success) {
          if (data.output.length > 0) {
            this.validateSpeechMeeting(data.output[0].meetingcode);
          } else {
            this.userService.failedSnackbar(
              'Please wait for your teacher to start.',
              2 + 1000
            );
          }
        }
        obs.unsubscribe();
      });
    } else {
      const obs = this.endSpeechMeeting(
        this.userService.getUserData().id
      ).subscribe(() => {
        const obs2$ = this.getOpenLabMeeting(lab).subscribe((data) => {
          if (data.success) {
            if (data.output.length > 0) {
              this.userService.failedSnackbar(
                `${data.output[0].firstname} ${data.output[0].lastname} is currently using ${data.output[0].lab}`
              );
            } else {
              this.createSpeechMeeting(lab);
            }
          }
          obs2$.unsubscribe();
        });
        obs.unsubscribe();
      });
    }
  }

  validateSpeechMeeting(meetingId: string) {
    const url = `https://api.videosdk.live/v2/rooms/validate/${meetingId}`;
    const headers = new HttpHeaders({
      authorization: environment.token,
      'Content-Type': 'application/json',
    });
    this.http
      .get<{ roomId: string }>(url, {
        headers,
      })
      .pipe(map((response) => response.roomId === meetingId))
      .subscribe(
        (isValid) => {
          if (isValid) {
            this.meetingID = meetingId;
            this.joinSpeechMeeting();
          } else {
            console.log('Room expired');
          }
        },
        (error) => {
          console.error('Failed to validate meeting:', error);
        }
      );
  }

  createSpeechMeeting(lab: string) {
    const apiUrl = 'https://api.videosdk.live/v2/rooms';
    const headers = new HttpHeaders({
      authorization: environment.token,
      'Content-Type': 'application/json',
    });
    this.http
      .post<{ roomId: string }>(apiUrl, {}, { headers })
      .pipe(map((response) => response.roomId))
      .subscribe(
        (roomid) => {
          this.meetingID = roomid;
          this.sessionID = this.utilityService.createID32();
          this.startSpeechMeeting(
            this.sessionID,
            this.userService.getUserData().id,
            this.meetingID,
            lab
          ).subscribe(
            (data) => {
              if (data.success) {
                this.joinSpeechMeeting();
              }
            },
            (error) => {
              this.userService.failedSnackbar(
                'Error while creating speech lab meet',
                2 + 1000
              );
            }
          );
        },
        (error) => {
          console.log(error);
        }
      );
  }

  async recordSpeechLabAttendance(id: string) {
    const checkObject = {
      selectors: ['*'],
      tables: 'speech_attendance',
      conditions: {
        WHERE: {
          StudentID: id,
          MeetingID: this.sessionID,
        },
      },
    };

    const data = await firstValueFrom(
      this.utilityService.post('get_entries', {
        data: JSON.stringify(checkObject),
      })
    );

    if (data.output.length > 0) return;

    const postObject = {
      tables: 'speech_attendance',
      values: {
        StudentID: id,
        MeetingID: this.sessionID,
      },
    };
    const res = await firstValueFrom(
      this.utilityService.post('create_entry', {
        data: JSON.stringify(postObject),
      })
    );
  }

  handleMeetingEvents(meeting: any) {
    meeting.on('error', (data: any) => {
      const { code, message } = data;
      console.log('Error', code, message);
    });
    meeting.on('meeting-joined', () => {
      this.micDisabled(undefined, meeting.localParticipant);
    });

    meeting.localParticipant.on('stream-enabled', (stream: any) => {
      this.micEnabled(stream, meeting.localParticipant);
    });
    meeting.localParticipant.on('stream-disabled', (stream: any) => {
      this.micDisabled(stream, meeting.localParticipant);
    });

    meeting.on('meeting-left', () => {
      this.utilityService.resetUI();
      if (this.userService.getUserType() == '1') {
        const obs = this.endSpeechMeeting(
          this.userService.getUserData().id
        ).subscribe(() => {
          obs.unsubscribe();
        });
      }
    });

    meeting.on('participant-joined', async (participant: any) => {
      if (this.userService.getUserType() == '1') {
        if (participant.metaData.who != '1') {
          this.recordSpeechLabAttendance(participant.metaData.id);
        }
      }

      this.micDisabled(undefined, participant);
      participant.setQuality('med');

      participant.on('stream-enabled', (stream: any) => {
        this.micEnabled(stream, participant);
      });
      participant.on('stream-disabled', (stream: any) => {
        this.micDisabled(stream, participant);
      });
    });

    meeting.on('participant-left', (participant: any) => {
      this.participantsAudio.delete(participant.id);
      if (participant.metaData.who == '1') {
        this.endSpeechMeeting(participant.id).subscribe();
        this.meeting.end();
        this.utilityService.resetUI();
      }
    });
    meeting.on('chat-message', (participantMessage: any) => {
      const { __, _, text } = participantMessage;
      const data = JSON.parse(text);

      if (data.type == 'message') {
        const now = new Date();
        const time = now.toLocaleString('en-US', {
          hour: 'numeric',
          minute: 'numeric',
          hour12: true,
        });
        this.messagingService.labMessages.push(
          new MessageObject(
            data.senderID,
            data.senderName,
            data.message,
            time,
            data.profile
          )
        );
      } else if (data.type == 'direct-message') {
        if (data.to == this.userService.getUserData().visibleid) {
          if (data.message != '') {
            this.utilityService.successSnackbar(data.message);
          }
          if (data.action) {
            this.labNotifiier.next(data.action);
          }
          this.audio.play();
        }
      } else if (data.type == 'direct-action') {
        if (this.userService.getUserData().visibleid == data.to) {
          this.labNotifiier.next(data.action);
        }
      } else if (data.type == 'reset') {
        if (this.userService.getUserType() == '0' && this.labID == data.labid) {
          this.router.navigate(['/student/speechlab/lab']);
        }
      } else {
        if (data.action?.includes('select:')) {
          const content = data.action.split(':')[1];
          this.router.navigate([
            '/student/speechlab/practice1',
            { m: content.split(';')[0], q: content.split(';')[1] },
          ]);
          return;
        }
        if (
          data.senderID != this.userService.getUserData().visibleid &&
          this.participantsAudio.get(data.senderID)
        ) {
          if (data.action == 'unmute') {
            const participant = this.participantsAudio.get(data.senderID);
            participant!.muted = false;
            this.participantsAudio.set(data.senderID, participant!);
          }
          if (data.action == 'mute') {
            const participant = this.participantsAudio.get(data.senderID);
            participant!.muted = true;
            this.participantsAudio.set(data.senderID, participant!);
          }
          this.labNotifiier.next(data.action);
        }
      }
    });
  }

  joinSpeechMeeting() {
    this.initSpeechMeeting();
    this.meeting.join();
    this.handleMeetingEvents(this.meeting);
  }

  leaveSpeechMeeting() {
    this.meeting?.leave();
    this.meeting = null;
    if (this.userService.getUserType() == '1') {
      this.endSpeechMeeting(this.userService.getUserData().id).subscribe();
    }
  }

  endSpeechMeeting(teacherID: string) {
    var tzoffset = new Date().getTimezoneOffset() * 60000;
    var localISOTime = new Date(Date.now() - tzoffset).toISOString();
    var time = localISOTime.slice(0, 19).replace('T', ' ');
    const postObject = {
      tables: 'lab_meetings',
      values: {
        EndTime: time,
      },
      conditions: {
        WHERE: {
          TeacherID: teacherID,
        },
        'AND EndTime IS ': 'NULL',
      },
    };
    return this.utilityService.post('update_entry', {
      data: JSON.stringify(postObject),
    });
  }

  micEnabled(stream: any, participant: any) {
    const mediaStream = new MediaStream();
    mediaStream.addTrack(stream.track);
    if (stream?.kind == 'audio') {
      if (participant.metaData.who == '1') {
        this.isMicOn = true;
        this.micLoading = false;
      }
      if (participant.id != this.userService.getUserData().visibleid) {
        const np = new ParticipantObject(participant.displayName, mediaStream);
        if (participant.metaData.who == '1') {
          np.muted = false;
        }
        this.participantsAudio.set(participant.id, np);
      }
    }
  }

  micDisabled(stream: any, participant: any) {
    if (stream?.kind == 'audio') {
      this.participantsAudio.delete(participant.id);
      this.isMicOn = false;
      this.micLoading = false;
    }
  }

  async toggleMic() {
    if (this.micLoading) return;
    if (this.isMicOn) {
      this.meeting.muteMic();
    } else {
      this.meeting.unmuteMic();
      this.micLoading = true;
    }
  }

  sendLabAction(action: string) {
    this.meeting.sendChatMessage(
      JSON.stringify({
        senderID: this.userService.getUserData().visibleid,
        senderName: this.userService.getFullName(),
        profile: this.userService.getUserData().profile,
        labid: this.labID,
        type: 'action',
        action: action,
      })
    );
  }

  sendDirectLabMessage(message: string, destination: string, action: string) {
    if (this.meeting == null) {
      return;
    }
    this.meeting.sendChatMessage(
      JSON.stringify({
        senderID: this.userService.getUserData().visibleid,
        senderName: this.userService.getFullName(),
        message: message,
        profile: this.userService.getUserData().profile,
        to: destination,
        action: action,
        type: 'direct-message',
      })
    );
  }

  sendLabMessage(message: string) {
    if (this.meeting == null) {
      return;
    }
    if (message.trim() != '') {
      this.meeting.sendChatMessage(
        JSON.stringify({
          senderID: this.userService.getUserData().visibleid,
          senderName: this.userService.getFullName(),
          message: message,
          profile: this.userService.getUserData().profile,
          type: 'message',
        })
      );
    }
  }
}
