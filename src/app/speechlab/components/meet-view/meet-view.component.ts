
import { Component,ElementRef,HostListener,OnDestroy,OnInit, ViewChild  } from "@angular/core";
import { HttpClient, HttpHeaders } from "@angular/common/http";
import { map } from "rxjs/operators";
import { environment } from 'src/environments/environment';
import { Participant, VideoSDK } from "@videosdk.live/js-sdk"; 
import { APIService } from "src/app/services/API/api.service";
import { MessageObject, ParticipantObject } from "src/app/shared/model/models";
import { MeetpopComponent } from "src/app/components/student/modals/meetpop/meetpop.component";
import { NgbModal, NgbModalOptions } from '@ng-bootstrap/ng-bootstrap';
import Swal from "sweetalert2";
import { ModalsComponent } from "../modals/modals.component";

@Component({
  selector: 'app-meet-view',
  templateUrl: './meet-view.component.html',
  styleUrls: ['./meet-view.component.css']
})


export class MeetViewComponent implements OnInit, OnDestroy{
  isFullScreen: boolean = false;
  showParticipants: boolean = false;
  private isOriginalOrientation: boolean = true;
  isChatModalOpen = false;
  @ViewChild('videoContainer')
  videoContainer!: ElementRef;
  constructor(
    private http: HttpClient,
    private API: APIService,
    private modalService: NgbModal,
  ) {
  
  }

  
  isTeacher = this.API.getUserType() =='1';
  denied = true;
  openModal() {
    const modalOptions: NgbModalOptions = {
      centered: false
      // You can add other options here if needed
    };

    const modalRef = this.modalService.open(ModalsComponent, modalOptions);
    modalRef.componentInstance.myCustomClass = 'custom-modal'; // Pass the custom class name

}

  


  toggleModal() {
    this.isChatModalOpen = !this.isChatModalOpen;
  }

  @HostListener('document:fullscreenchange', ['$event'])
  onFullScreenChange() {
    this.isFullScreen = !!document.fullscreenElement;
  }

  toggleParticipants() {
    this.showParticipants = !this.showParticipants;
  }

  toggleFullScreen() {
    const elem = this.videoContainer.nativeElement;

    if (!document.fullscreenElement) {
        if (elem.requestFullscreen) {
            elem.requestFullscreen().then(() => {
                this.isFullScreen = true;
            });
        } 
    } else {
        if (document.exitFullscreen) {
            document.exitFullscreen().then(() => {
                this.isFullScreen = false;
            });
        } 
    }
}

meetingInfo:any;

  meetSettings(){
    const modalRef = this.modalService.open(MeetpopComponent);
    modalRef.closed.subscribe(data=>{
      if(data != null){
          this.isWebCamOn = this.API.joinWithCamera!;
          this.isMicOn = this.API.joinWithMic!;
          // this.meetingHeader = this.API.meetingInfo.course;
          this.meetingInfo  = this.API.meetingInfo;
          this.startClass();
      }
    })
  }

  ngOnDestroy(): void {
    this.API.showLoader();
    const obs$ = this.API.getStudentAssignedLab().subscribe(data=>{
      if(data.success){
        this.denied = false;
        this.API.hideLoader();
      }else{
        this.API.failedSnackbar('Failed to connect the server...');
        this.API.hideLoader();
      }
      obs$.unsubscribe();
    })
    if(this.meeting == null){
      return;
    }
    this.meeting?.leave();
    this.API.resetMeetOptions();
  }
  items: any[] = [
    { imageUrl: 'assets/ken.jpg', alt: 'Ken' },
    { imageUrl: 'assets/cleo.jpg', alt: 'Cleo' },
    { imageUrl: 'assets/juswa.jpg', alt: 'Juswa' },
    { imageUrl: 'assets/tonzxz.jpg', alt: 'Tonzxz' },
    { imageUrl: 'assets/cleo.jpg', alt: 'Cleo' },
    { imageUrl: 'assets/tonzxz.jpg', alt: 'Tonzxz' },
  ];

  currentPosition = 0;

  moveLeft() {
    if (this.currentPosition > 0) {
      this.currentPosition--;
    }
  }

  moveRight() {
    // Assuming each row has 5 columns
    const maxPosition = this.items.length - 5;
    if (this.currentPosition < maxPosition) {
      this.currentPosition++;
    }
  }

  shouldDisplay(index: number): boolean {
    return index >= this.currentPosition && index < this.currentPosition + 5;
  }

  /* ---------- GMEET --------------*/

  meetingHeader:string = '';
  teacherName:string = '';
  meetingID:string = '';
  meeting:any;
  participantName:string = '';
  particpantID?:string;
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
  messages:Array<MessageObject> = [];
  webCamLoading:boolean = false;
  shareScreenLoading:boolean = false;
  sessionID:string = this.API.createID32();

  participantSharing:any = {
    id:'none',
    name: 'Participant'
  };

  @ViewChild('messageInput') messageInput?: ElementRef;


  ngOnInit(): void {
    const user = this.API.getUserData();
    this.participantName = user.firstname + ' ' + user.lastname;
    this.particpantID = user.id;
    this.profile = user.profile;
    this.participantType = this.API.getUserType();
    if(this.API.getUserType()=='1'){
      this.teacherName = this.participantName;
      this.API.endMeeting(this.particpantID!).subscribe();
      if(this.API.joinWithCamera != undefined && this.API.joinWithCamera != null){
        this.isWebCamOn = this.API.joinWithCamera;
        this.isMicOn = this.API.joinWithMic!;
        this.API.resetMeetOptions();
        this.startClass();
      }
    }
  }


  texthandler(event: any) {
    this.message = event.target.value;
  }

  clearInput(){
    this.messageInput!.nativeElement.value = '';
    this.message = '';
  }

  startClass(){
    this.showScreen = 1;
    if(this.participantType == '0'){
      this.API.getMeeting(this.particpantID!).subscribe(data=>{
        if(data.success){
          if(data.output.length > 0){
            this.validateMeeting(data.output[0].meetingcode)
            this.meetingHeader = data.output[0].course
          }else{
            this.API.failedSnackbar('Selected class has no ongoing meet this time.', this.notifTime + 1000)
            this.API.resetMeetOptions();
            this.showScreen = 0;
          }
        }
      });
    }else{
      this.API.endMeeting(this.particpantID!).subscribe(()=>{
        this.createMeeting();
      });
      
    }
  }
  createMeeting(){
    const apiUrl = "https://api.videosdk.live/v2/rooms";
    const headers = new HttpHeaders({
      authorization: environment.token,
      'Content-Type': 'application/json',
    });
    this.http
      .post<{ roomId: string }>(apiUrl, {}, { headers })
      .pipe(map((response) => response.roomId)).subscribe((roomid) => {
        this.meetingID = roomid;
        this.sessionID = this.API.createID32();
        this.API.startMeeting(this.sessionID,this.particpantID!, this.meetingID).subscribe(
          data=>{
            if(data.success){
              this.meetingHeader = `${this.API.meetingInfo.course} (${this.API.meetingInfo.class})`;
            }
            this.joinMeeting();
          },
          error=>{
            this.API.failedSnackbar('Error while creating class', this.notifTime+1000);
          }
        )
        
      },
      error =>{
        console.log(error);
      }
      );
  }
  validateMeeting(meetingId: string) {
    const url = `https://api.videosdk.live/v2/rooms/validate/${meetingId}`;
    const headers = new HttpHeaders({
      authorization: environment.token,
      'Content-Type': 'application/json',
    });
    this.http
      .get<{ roomId: string }>(url, {
        headers,
      })
      .pipe(map((response) => response.roomId === meetingId)).subscribe(isValid=>{
        if (isValid) {
          this.meetingID = meetingId;
          this.joinMeeting();
        } else {
          console.log('Room expired')
        }
      },
      (error) => {
        console.error("Failed to validate meeting:", error);
      });
  }
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

  joinMeeting() {
    this.initMeeting();
    this.meeting.join();
    this.handleMeetingEvents(this.meeting);
    if(this.participantType == '1'){
      // this.API.notifyParticipants('You have an ongoing meet with '+ this.participantName+'.');
      this.API.notifyStudentsInClass(
        `${this.participantName} started a synchronous class.`,
        `${this.participantName} started a meet with your class <b>'${this.meetingInfo.class}'</b> on <b>'${this.meetingInfo.course}'</b>. Try to catch up with the meeting!.`
      )
      
    }
  }

  handleMeetingEvents(meeting: any) {
    meeting.on("error", (data:any) => {
      const { code, message } = data;
      console.log("Error",code,message);
      if(code == 3016){
        this.shareScreenLoading = false;
      }
      if(code == 3015){
        this.micLoading = false;
        this.API.failedSnackbar("Unable to start microphone, please check your browser permissions.");
      }
      if(code == 3014){
        this.webCamLoading = false;
        this.API.failedSnackbar("Unable to start camera, please check your browser permissions.");
      }
    });
    // meeting joined event
    meeting.on("meeting-joined", () => {
      this.localParticipant = meeting.localParticipant;
      this.handleStreamDisabled(
        undefined,
        meeting.localParticipant,
        true
      );
    });

    meeting.localParticipant.on("stream-enabled", (stream: any) => {
      this.handleStreamEnabled(
        stream,
        meeting.localParticipant,
        true
      );
    });
    meeting.localParticipant.on("stream-disabled", (stream: any) => {
      this.handleStreamDisabled(
        stream,
        meeting.localParticipant,
        true
      );
      this.showScreen = 2;
    });

    // meeting left event
    meeting.on("meeting-left", () => {
      this.API.justSnackbar(this.localParticipant.displayName+ ' left the meeting', this.notifTime)
      this.resetUI();
      if(this.participantType =='1'){
        this.API.endMeeting(this.particpantID!).subscribe();
      }
    });
  

    meeting.on("participant-joined", (participant: any) => {
      if(!this.meNotifDisplayed){
        if(participant.id == this.particpantID){
          this.API.justSnackbar(participant.displayName+ ' joined the meeting', this.notifTime);
          this.meNotifDisplayed = true;
        }
      }else{
        this.API.justSnackbar(participant.displayName+ ' joined the meeting', this.notifTime)
      }
      this.handleStreamDisabled(
        undefined,
        participant,
        true
      );
      participant.setQuality("high");
      this.participantSize = meeting.participants.size;
      if(this.largestParticipantSize < this.participantSize + 1){
        this.largestParticipantSize = this.participantSize + 1;
        this.API.updateParticipantCount(this.sessionID, this.largestParticipantSize);
      }
      if(participant.metaData.who == '1'){
        this.teacherName = participant.displayName;
      }
      participant.on("stream-enabled", (stream: any) => {
        this.handleStreamEnabled(
          stream,
          participant,
          false
        );
      });
      participant.on("stream-disabled", (stream: any) => {
        this.handleStreamDisabled(
          stream,
          participant,
          false
        );
      });
    });

    // participants left
    meeting.on("participant-left", (participant: any) => {
      this.participantSize = meeting.participants.size;
      this.API.justSnackbar(participant.displayName+ ' left the meeting', this.notifTime)
      this.participants.delete(participant.id);
      if(this.participantSharing.id == participant.id){
        this.shareSrc = undefined;
        this.isSharingScreen =false;
      }
      if(participant.metaData.who =='1'){
        this.API.endMeeting(participant.id).subscribe();
        this.meeting.end();
        this.resetUI();
      }
    });
    meeting.on("chat-message",(participantMessage:any)=>{
      const { __, _, text } = participantMessage;
      const data = JSON.parse(text);
      if(data.type == "webcam-enabled"){
        // if(data.who == '1'){
        //   this.webCamLoading = true;
        //   return;
        // }
        if(this.activeParticipants.has(data.senderID)){
          var participant = this.activeParticipants.get(data.senderID);
          if(participant != null){
            participant.isLoading = true;
            this.activeParticipants.set(data.senderID, participant)
          }else{
            participant = new ParticipantObject(data.senderName, undefined)
            participant.isLoading = true;
            this.activeParticipants.set(data.senderID, participant)
          }
        }else{
          var participant = this.participants.get(data.senderID);
          if(participant != null){
            participant.isLoading = true;
            this.participants.set(data.senderID, participant)
          }else{
            participant = new ParticipantObject(data.senderName, undefined)
            participant.isLoading = true;
            this.participants.set(data.senderID, participant)
          }
        }
        return;
      }
      if(data.type == 'share-enabled'){
        this.shareScreenLoading = true;
        return;
      }
      const now = new Date();
      const time =  now.toLocaleString("en-US", {
        hour: "numeric",
        minute: "numeric",
        hour12: true,
       });
      this.messages.push(new MessageObject(data.senderID, data.senderName, data.message, time, data.profile))
    })

    meeting.on("speaker-changed", (speakerID:any) => {
      if(speakerID != undefined && speakerID != null){
        if(this.participantType=='1'){
          return;
        }
         if(!this.activeParticipants.has(speakerID) && this.participants.has(speakerID)){
          const active =  this.participants.get(speakerID);
          this.participants.delete(speakerID);
          if(this.activeParticipants.size > 0){
            const inactiveKey = this.activeParticipants.keys().next().value;
            const inactive = this.activeParticipants.get(inactiveKey);
            this.activeParticipants.delete(inactiveKey);
            this.participants.set(inactiveKey, inactive!);
          }
          this.activeParticipants.set(speakerID, active!);
         }
      }
    });
  }

  getURL(file:string){
    return file;
  }

  leaveMeeting(){
    this.meeting?.leave();
    if(this.participantType =='1'){
      this.API.notifyParticipants(this.participantName+ ' ended the meeting.');
      this.API.endMeeting(this.particpantID!).subscribe();
    }
  }

  raiseHand(){
    this.meeting?.sendChatMessage(JSON.stringify({ type: "RAISE_HAND", data: {} }));
  }

  toggleWebcam() {
    if(this.webCamLoading) return;
    if (this.isWebCamOn) {
      this.meeting.disableWebcam();
    } else {
      this.meeting.enableWebcam();
      // this.meeting.sendChatMessage(JSON.stringify({
      //   'senderID': this.particpantID,
      //   'senderName': this.participantName, 
      //   'type': 'webcam-enabled',
      //   'who': this.participantType
      // }));
      if(this.participantType == '1'){
        this.webCamLoading = true;
      }
    }
  }

  shareScreen(){
    if(this.shareScreenLoading) return;
    if (this.isSharingScreen) {
      this.meeting?.disableScreenShare();
    } else {
      this.meeting?.enableScreenShare();
      this.meeting.sendChatMessage(JSON.stringify({
        'senderID': this.particpantID,
        'senderName': this.participantName, 
        'type': 'share-enabled',
        'who': this.participantType
      }));
      // if(this.participantType == '1'){
        this.shareScreenLoading = true;
      // }
      
    }
  }

  sendMessage(){
    if(this.meeting == null){
      this.clearInput();
      return;
    }
    if(this.message.trim() != ''){
      this.meeting.sendChatMessage(JSON.stringify({
          'senderID': this.particpantID,
          'senderName': this.participantName, 
          'message': this.message,
          'profile': this.profile
      }));
    }
    this.clearInput();
  }

  micLoading = false;

  async toggleMic() {
    if(this.micLoading) return;
    if (this.isMicOn) {
      this.meeting.muteMic();
    } else {
      this.meeting.unmuteMic();
      this.micLoading = true;
    }
  }

  resetUI(){
    this.showScreen = 0;
    this.participants.clear();
    this.participantsAudio.clear();
    this.activeParticipants.clear();
    this.meetingHeader = '';
    this.messages = [];
    this.meNotifDisplayed = false;
    this.webCamLoading = false;
    this.shareScreenLoading = false;
    this.micLoading = false;
    this.largestParticipantSize = 1;
    this.API.resetMeetOptions();
  }


  handleStreamEnabled(
    stream: any,
    participant: any,
    isLocal: any,
  ) {
    const mediaStream = new MediaStream();
    mediaStream.addTrack(stream.track);
    if (stream.kind == "video") {
      if(participant.metaData.who == '0'){
       if(this.activeParticipants.has(participant.id)){
        this.activeParticipants.set(participant.id,new ParticipantObject(participant.displayName, mediaStream))
       }else{
        this.participants.set(participant.id,new ParticipantObject(participant.displayName, mediaStream))
       }
      }else{
        this.mainSrc = new ParticipantObject(participant.displayName, mediaStream);
      }
      if(participant.id == this.particpantID){
        this.webCamLoading = false;
        this.isWebCamOn = true;
      }
      this.showScreen = 2;
    }
    if (stream.kind == "audio"){
      if(participant.id != this.particpantID){
        this.participantsAudio.set(participant.id,new ParticipantObject(participant.displayName, mediaStream))
      }else{
        this.micLoading = false;
        this.isMicOn = true;
      }
      
    }
    if(stream.kind == 'share'){
      if(!this.isSharingScreen){
        if(participant.id == this.particpantID){
        //  if(participant.metaData.who =='1'){
        //   this.meeting.disableWebcam();
        //  }
          this.isSharingScreen = true;
        }
        this.shareSrc = new ParticipantObject(participant.displayName, mediaStream);
        this.participantSharing = {
          id: participant.id,
          name: participant.displayName,
        };
      }
      this.shareScreenLoading = false;
    }
    
  }

  handleStreamDisabled(
    stream: any,
    participant: any,
    isLocal: any,
  ) {
    if(stream == undefined){
      if(participant.metaData.who == '0'){
        if(this.activeParticipants.has(participant.id)){
          this.activeParticipants.set(participant.id,new ParticipantObject(participant.displayName, undefined))
        }else{
          this.participants.set(participant.id,new ParticipantObject(participant.displayName, undefined))
        }
        
      }else{
        this.mainSrc = undefined;
      }
      this.showScreen = 2;
    }else{
      if (stream.kind == "video") {
        if(participant.metaData.who == '0'){
          if(this.activeParticipants.has(participant.id)){
            this.activeParticipants.set(participant.id,new ParticipantObject(participant.displayName, undefined))
          }else{
            this.participants.set(participant.id,new ParticipantObject(participant.displayName, undefined))
          }
        }else{
          this.mainSrc = undefined;
        }
        if(participant.id == this.particpantID){
          this.isWebCamOn = false;
        }
        this.showScreen = 2;
      }

      if(stream.kind == 'audio'){
        this.isMicOn = false;
      }
  
      if (stream.kind == "share") {
        this.shareSrc = undefined;
        this.isSharingScreen =false;
        if(participant.id == this.particpantID){
          // if(this.isWebCamOn){
            // this.meeting.enableWebcam();
            // this.webCamLoading = true;
          // }
        }
        this.showScreen = 2;
      }
    }
  }
}

