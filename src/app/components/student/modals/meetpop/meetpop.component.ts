import { Component, OnInit } from '@angular/core';
import { NgbModal, NgbActiveModal } from '@ng-bootstrap/ng-bootstrap';
import { Router } from '@angular/router';
import { APIService } from 'src/app/services/API/api.service';


@Component({
  selector: 'app-meetpop',
  templateUrl: './meetpop.component.html',
  styleUrls: ['./meetpop.component.css']
})
export class MeetpopComponent implements OnInit {
  isMicMuted: boolean = false;
  isVideoDisabled: boolean = false;
  classObj:any;
  classes:Array<any> = [];
  constructor(
    private API: APIService,
    public activeModal: NgbActiveModal
  ) {}

  isTeacher = false;

  isloading= true;

  ngOnInit(): void {
      this.API.getClasses().subscribe(data=>{
        if(data.success){
          this.classes = data.output;
          if(this.API.getUserType()=='1'){
            this.isTeacher = true;
          }
          this.isloading = false;
        }
      });
  }

  toggleMic() {
    this.isMicMuted = !this.isMicMuted;
  }

  toggleVideo() {
    this.isVideoDisabled = !this.isVideoDisabled;
  }

  cancelCreation() {
    this.activeModal.close();  
    // You can pass any data you want back to the calling component here
  }

  setClass(classObj:any){
    this.classObj =  classObj
  }

  checkIfHasClass(){
    if(this.isloading) return;
    if (this.classes.length <= 0){
      if(this.API.getUserType() == '0'){
        this.API.failedSnackbar('No enrolled classes to show.');
      }else{
        this.API.failedSnackbar('You have no classes to show.');
      }
    }
  }

  joinNow() {
    if(this.classObj == null){
      return;
    }
    this.API.setClass(this.classObj.id);
    this.API.setMeetPermissions(this.isVideoDisabled,this.isMicMuted);
    this.API.meetingInfo = {
      course: this.classObj.course,
      class : this.classObj.class
    };
    this.API.joinMeet();
    this.activeModal.close(this.classObj.course);
  }
}
