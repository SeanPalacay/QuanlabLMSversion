import { Component, ElementRef, OnDestroy, OnInit, ViewChild } from '@angular/core';
import { Router } from '@angular/router';
import { VideoSDK } from '@videosdk.live/js-sdk';
import { BehaviorSubject, Observable } from 'rxjs';
import { APIService } from 'src/app/services/API/api.service';
import { MessageObject, ParticipantObject } from "src/app/shared/model/models";
import { environment } from 'src/environments/environment';

@Component({
  selector: 'app-lab-container',
  templateUrl: './lab-container.component.html',
  styleUrls: ['./lab-container.component.css']
})
export class LabContainerComponent implements OnInit, OnDestroy {
  constructor(private API:APIService,private router:Router) {}

  // gmeet

  messages:Array<MessageObject> = [];
  meetingHeader:string = '';
  teacherName:string = '';
  meetingID:string = '';
  meeting:any;
  participantName:string = '';
  particpantID:string= this.API.getUserData().visibleid;
  mainSrc?:ParticipantObject;
  shareSrc?:ParticipantObject
  message:string = '';
  notifTime:number = 2000;
  participants: Map<string, ParticipantObject> = new Map();
  participantsAudio: Map<string, ParticipantObject> = new Map();
  activeParticipants:Map<string, ParticipantObject> = new Map();
  participantType?:string;
  participantSize:number = 0;
  largestParticipantSize:number = 1;
  profile?:string;
  
  meNotifDisplayed = false;

  localParticipant: any;
  showScreen:number = 0;
  isWebCamOn:boolean = true;
  isMicOn:boolean = true;
  isSharingScreen:boolean = false;
  webCamLoading:boolean = false;
  shareScreenLoading:boolean = false;
  sessionID:string = this.API.createID32();

  async initMeeting() {
    VideoSDK.config(environment.token);
    this.meeting = VideoSDK.initMeeting({
      meetingId: this.meetingID, // required
      participantId : this.particpantID,
      name: this.participantName, // required
      metaData: {'who': this.participantType},
      micEnabled: this.isMicOn, // optional, default: true
      webcamEnabled: this.isWebCamOn, // optional, default: true
    });
  }

  getURL(file:string){
    return file;
  }

  
  texthandler(event: any) {
    this.message = event.target.value;
  }

  sendMessage(){
    if(this.API.meeting == null){
      this.clearInput();
      return;
    }
    if(this.message.trim() != ''){
     this.API.sendLabMessage(this.message);
    }
    this.clearInput();
  }
  
  @ViewChild('messageInput') messageInput?: ElementRef;


  clearInput(){
    this.messageInput!.nativeElement.value = '';
    this.message = '';
  }
  
  
  getMessages(){
    return this.API.labMessages;
  }


  speechLabs = [];
  labID?:string;
  joinClass(){
    this.API.startLab(this.labID!)
  }

  hasMeet(){
    return this.API.meeting != null;
  }

  loadLabs(){
    // this.API.showLoader();
    const obs$ = this.API.loadSpeechLabs().subscribe(data=>{
      if(data.success){
        this.speechLabs = data.output;
      }
      obs$.unsubscribe();
    })  
  }
  isTeacher = this.API.getUserType() =='1';
  denied = true;
  selectingModule = false;
  notifier$:any;
  ngOnInit(): void {
    this.API.labNotifiier =  new BehaviorSubject<any>(null);
    this.notifier$ = this.API.labNotifiier.subscribe(action=>{
      // this.API.successSnackbar(action);
      if(action == 'wait-for-module'){
        this.selectingModule = true;
      }
      if(action?.includes('select:')){
        const content = action.split(':')[1];
        this.router.navigate(['/student/speechlab/practice1', { m: content.split(';')[0], q: content.split(';')[1] }]);
      }
    })
    this.API.showLoader();
    const obs$ = this.API.getStudentAssignedLab().subscribe(data=>{
      if(data.success){
        if(data.output.length > 0){
          this.labID = data.output[0].labid;
          // this.API.successSnackbar(this.labID!);
          this.API.labID = data.output[0].labid;
          // const obs = this.API.getSpeechMeeting(this.API.getUserData().id, this.labID!
          // ).subscribe(data=>{
          //   if(data.success){
          //     if(data.output.length > 0){
          //       this.API.validateSpeechMeeting(data.output[0].meetingcode)
          //     }else{
          //       this.API.failedSnackbar('Please wait for your teacher to start.', 2 + 1000)
          //     }
          //   }
          //   obs.unsubscribe();
          // });
          this.denied = false;
        }
        this.API.hideLoader();
      }else{
        this.API.failedSnackbar('Failed to connect the server...');
        this.API.hideLoader();
      }
      obs$.unsubscribe();
    })
  }
  ngOnDestroy(): void {
    this.notifier$.unsubscribe();
  }
  getParticipants(){
    return this.API.participantsAudio;
  }

  attendanceRecorded = false;

  recordAttendance() {
    const userName = 'John Doe'; // Replace with the actual user's name
  
    // Get the current date and time
    const currentDateTime = new Date().toLocaleString();
  
    // Log the attendance details
    console.log(`Attendance recorded for ${userName}`);
    console.log(`Date and Time: ${currentDateTime}`);
  
    // Update the button state
    this.attendanceRecorded = true;
  }

}
