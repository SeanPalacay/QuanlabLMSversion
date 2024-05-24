import { Injectable } from '@angular/core';
import { MeetingService } from './meeting.service';
import { UserService } from './user.service';
import { UtilityService } from './utility.service';

@Injectable({
  providedIn: 'root',
})
export class LifecycleService {
  backgroundID: any = 0;

  constructor(
    private meetingService: MeetingService,
    private userService: UserService,
    private utilityService: UtilityService
  ) {
    this.backgroundID = setInterval(() => {
      if (this.utilityService.online) {
        this.utilityService.updateLastSeen();
      }
    }, 3000);
  }

  ngOnInit() {
    console.log('ngOnInit');
    const obs = this.meetingService
      .endSpeechMeeting(this.userService.getUserData().id)
      .subscribe(() => {
        obs.unsubscribe();
      });
  }

  ngOnDestroy() {
    console.log('ngOnDestroy');
    if (this.backgroundID) {
      clearInterval(this.backgroundID);
    }
    this.userService.downloadProgress$.unsubscribe();
    const obs = this.meetingService
      .endSpeechMeeting(this.userService.getUserData().id)
      .subscribe(() => {
        obs.unsubscribe();
      });
  }
}
