import { Component, OnInit } from '@angular/core';
import { NgbModal, NgbActiveModal } from '@ng-bootstrap/ng-bootstrap';
import { Router } from '@angular/router';
import { APIService } from 'src/app/services/API/api.service';

@Component({
  selector: 'app-createmeet',
  templateUrl: './createmeet.component.html',
  styleUrls: ['./createmeet.component.css']
})
export class CreatemeetComponent {

  isMicMuted: boolean = false;
  isVideoDisabled: boolean = false;

  constructor(
    public activeModal: NgbActiveModal,
    private API : APIService
    ) {}


  toggleMic() {
      this.isMicMuted = !this.isMicMuted;
    }

  toggleVideo() {
    this.isVideoDisabled = !this.isVideoDisabled;
  }

  cancelCreation() {
    this.activeModal.close('Close');
    // You can pass any data you want back to the calling component here
  }

  joinNow() {
    this.API.setMeetPermissions(this.isVideoDisabled, this.isMicMuted);
    this.API.joinMeet();
    this.activeModal.close('Join Now click');
  }
}
