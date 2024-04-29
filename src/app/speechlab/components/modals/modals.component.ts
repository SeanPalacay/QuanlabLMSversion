import { Component, ElementRef, EventEmitter, Input, Output, ViewChild } from '@angular/core';
import { Router } from '@angular/router';
import { NgbActiveModal } from '@ng-bootstrap/ng-bootstrap';
import { VideoSDK } from '@videosdk.live/js-sdk';
import { APIService } from 'src/app/services/API/api.service';
import { MessageObject, ParticipantObject } from "src/app/shared/model/models";
import { environment } from 'src/environments/environment';
import Swal from 'sweetalert2';

@Component({
  selector: 'app-modals',
  templateUrl: './modals.component.html',
  styleUrls: ['./modals.component.css']
})
export class ModalsComponent {
getURL(arg0: string) {
throw new Error('Method not implemented.');
}
  solo= false;
  // choosenSolo: any;
  groupings= false;
  groupingItems: any[] = [];
  habo = false;
  layout= true;
  maxGrouping: number = 2; 
  groupColor: string = 'blue';
  editedLayout = false;
  soloButton: boolean = false;
  editedLayoutGroupings = false;
  startMeet = false;
  isChatModalOpen = false;
  disabled = true; 
  showStartMeetingButton: boolean = false;
  defaultLayout = false;
  


  



  



  constructor(private API:APIService, private router:Router) {
    
  }

  @ViewChild('messageInput') messageInput?: ElementRef;


  @Input() myCustomClass: string = '';

  row1:any[] = []
  row2:any[] = []
  row3:any[] = [];
  messages:Array<MessageObject> = [];
  
  students:any[]= [];
  speechLabs:any[] = []
  speechLabSelected:number = 0;

  

  // async ngOnInit() {
  //   [this.row1,this.row2, this.row3]= await this.API.loadComputers();
  //   this.loadStudents();
  //   this.loadLabs();
  // }

  async ngOnInit(): Promise<void> {
    const user = this.API.getUserData();
    this.participantName = user.firstname + ' ' + user.lastname;
    this.particpantID = user.visibleid;
    this.profile = user.profile;
    this.participantType = this.API.getUserType();
    if(this.API.chosenPCs){
      for(let pc of this.API.chosenPCs){
        const studentAudio =  this.API.participantsAudio.get(pc.ip);
        if(studentAudio){
          studentAudio!.muted = true;
          this.API.participantsAudio.set(pc.ip, studentAudio!);
        }
      }
      this.API.chosenPCs = false;
    }
    // if (this.participantType === '1') {
    //   this.teacherName = this.participantName;
    //   this.API.endMeeting(this.particpantID!).subscribe();
    //   if (this.API.joinWithCamera !== undefined && this.API.joinWithCamera !== null) {
    //     this.isWebCamOn = this.API.joinWithCamera;
    //     this.isMicOn = this.API.joinWithMic!;
    //     this.API.resetMeetOptions();
    //     this.startClass();
    //   }
    // }
  
    [this.row1, this.row2, this.row3] = await this.API.loadComputers();
    this.loadStudents();

    if(this.API.meeting == null){
      const obs = this.API.getTeacherMeeting().subscribe(data=>{
        if(data.success){
          if(data.output.length > 0){
            this.API.labID = data.output[0].labid;
            this.API.sessionID = data.output[0].id;
            this.API.validateSpeechMeeting(data.output[0].meetingcode)
          }
        }
        this.loadLabs();
        obs.unsubscribe();
      });
    }else{
      this.API.resetStudents();
      this.loadLabs();
    }
    
  }
  

 // meet 
 teacherName:string = '';
 message:string = '';
 meeting:any;
 meetingID:string = '';
 participantName:string = '';
 particpantID?:string;
 participantType?:string;
 isWebCamOn:boolean = true;
 isMicOn:boolean = true;
 isMicOnn:boolean = true;

 profile?:string;

 micIsOn(){
  return this.API.isMicOn;
 }

 onMic() {

   this.API.toggleMic();
  // if(this.isMicOnn){
  //   this.API.sendLabAction('unmute')

  // }else{
  //   this.API.sendLabAction('mute');
  // }
 }

 hasMeet(){
  return this.API.meeting != null;
 }



 selectedLab:number = 0;

showStartMeeting(index:number) {
  this.selectedLab = index;
  this.showStartMeetingButton = true;
}


 clearInput(){
  this.messageInput!.nativeElement.value = '';
  this.message = '';
}


 texthandler(event: any) {
  this.message = event.target.value;
}

 toggleModal() {
  this.isChatModalOpen = !this.isChatModalOpen;
}

async initMeeting() {
  VideoSDK.config(environment.token);
  this.meeting = VideoSDK.initMeeting({
    meetingId: this.meetingID, // required
    participantId : this.particpantID,
    name: this.participantName, // required
    metaData: {'who': this.participantType},
    micEnabled: this.isMicOn, // optional, default: true
    webcamEnabled: this.isWebCamOn, 
  });
}
 // end meet 

  openSolo() {
    this.solo = true;
    this.soloButton = true;

    this.layout = false;
    this.editedLayout = false;
    this.editedLayoutGroupings = false;
   
    this.groupings = false;
  
   
  }

  
  openGroupings() {
    this.groupings = true;

    this.solo = false;
    this.soloButton = false;

    this.API.chosenPCs = false;

    this.layout = false;
    this.editedLayoutGroupings = false;
    this.editedLayout = false;
  }

  saveSolo() {
    this.solo = false;
    this.editedLayout = true;
  }

  closeSolo() {
    this.solo = false;
    this.layout = true;
    this.defaultLayout = true;
  }

  closeGroupings() {
    this.groupings = false;
    this.layout = true;
    this.defaultLayout = true;
  }

  soloGropings(item:any ) {
    this.API.chosenPCs = [item];
  }

  
  startClass() {
    this.startMeet = !false;
    this.API.startLab(this.speechLabs[this.selectedLab].id)
    this.API.labID = this.speechLabs[this.selectedLab].id;
    this.loadLabs();
  }
  endClass() {
    this.API.leaveSpeechMeeting();
    this.startMeet = false;
  }

  // saveGroupings(color: string) {
  //   this.groupColor = color;
  //   this.groupings = true;
  // }

  confirmSave() {
    this.groupings = false;
    this.editedLayoutGroupings = true;
    
  }
  
  getSolo(){
    return this.API.chosenPCs ? this.API.chosenPCs.length == 1 ? this.API.chosenPCs[0] : false : false;
  }



  saveGroupings(color: string) {
    if (this.groupings && this.groupColor === color) {
      this.confirmSave(); 
      
    } else {
      this.groupColor = color;
      this.groupings = true;
    }
   

  }
  

  
  // changePCColor(color: string) {
  //   this.groupColor = color;
  // }
  

  dakolGroupings( item: any) {
    const index = this.groupingItems.indexOf(item);

    if (index === -1) {
      if(this.groupingItems.length < this.maxGrouping) {
        // item.group = 1
        this.groupingItems.push(item);
        if(this.API.chosenPCs){
          this.API.chosenPCs.push(item);
        }else{
          this.API.chosenPCs = [item];
        }
        console.log(this.API.chosenPCs);
      }
    } else {
      this.groupingItems.splice(index, 1);
      if(this.API.chosenPCs){
        this.API.chosenPCs.splice(index, 1);
      }
    }
  }
  
  addStudentGrouping() {
    this.maxGrouping++;
  }

  bawasStudentGrouping() {
    if(this.maxGrouping > 2) {
      this.groupingItems.pop();
      this.maxGrouping--;
    }
  }

  groupNumbers() {
   return Math.floor(25/this.maxGrouping);
  }


 


  loadStudents(){
    const obs$ = this.API.getStudents().subscribe((data) => {
      if (data.success) {
        this.students = data.output;
      } else {
        this.API.failedSnackbar('Unable to load student data');
      }
      obs$.unsubscribe();
    });
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
  
  getMessages(){
    return this.API.labMessages;
  }


  loadLabs(){
    // this.API.showLoader();
    const obs$ = this.API.loadSpeechLabs().subscribe(data=>{
      if(data.success){
        this.speechLabs = data.output;
      }
      this.loadAssignedAddresses();
      obs$.unsubscribe();
    })  
  }

  selectModule(){
    this.API.sendDirectLabMessage('You are selected for Solo!, Get Ready!', this.API.chosenPCs[0].ip,'wait-for-module' );
    this.router.navigate(['/teacher/speechlab/paractice-parent']);
  }
  selectModuleGroup(){
    for(let pc of this.API.chosenPCs){
      this.API.sendDirectLabMessage('You are selected for with Group!, Get Ready!', pc.ip,'wait-for-module' );
    }
    this.router.navigate(['/teacher/speechlab/paractice-parent']);
  }

  selectLab(index:number){
    this.speechLabSelected = index;
    // this.loadAssignedAddresses();
  }

  loadedAddresses:Map<string,any>= new Map();

  loadAssignedAddresses(){
    if(this.speechLabs.length > 0){
      const obs$ = this.API.loadComputerAddresses().subscribe(data=>{
        if(data.success){
          const assignMap = new Map<string,any>( data.output.filter((e:any)=>e.labid ==this.API.labID).map((entry:any)=> [entry.name, entry]))
          this.loadedAddresses = new Map<string,any>( data.output.map((entry:any)=> [entry.address, entry]))
          for(let pc of [...this.row1, ...this.row2, ...this.row3]){
            pc.ip = assignMap.get(pc.label)?.address ?? '';
            pc.id = assignMap.get(pc.label)?.id ?? null;
          }
        }
        this.API.hideLoader();
        obs$.unsubscribe();
      })  
    }else{
      this.API.showLoader();
      this.API.failedSnackbar('Failed loading speechlabs')
    }
   
  }

  getParticipants(){
    return this.API.participantsAudio;
  }



  @Output() valueChanged = new EventEmitter<boolean>();
  value: boolean = false;

  checkIfAssigned(student:any){
    const pcs = [...this.row1, ...this.row2, ...this.row3];
    const found = pcs.find((pc)=> pc.ip == student.visibleid);
    return found;
  }

  checkIfAssignedOnOtherLab(student:string){
    const address = this.loadedAddresses.get(student);
    if(address && this.speechLabs.length){
      if(address.labid != this.speechLabs[this.speechLabSelected].id){
        return address;
      }
    }else{
      return false;
    }
  }

  getAssignedName(pc:any){
    // const student = this.students.find((student)=> student.visibleid == pc.ip);
    // const student = this.students.find((student)=> student.visibleid == pc.ip);
    const student = this.API.participantsAudio.get(pc.ip)
    if(student){
      // return `${student.firstname} ${student.lastname}`;
      return `${student.name}`;
    }else{
      return 'None'
    }
  }

  getLabFromID(id:string){
    return this.speechLabs.find((lab)=>lab.id == id)
  }



  toggleValue() {
    this.value = !this.value;
    this.valueChanged.emit(this.value);
  }

  checkDuplicate(studentId:string, pcLabel:any){
    const pcs = [...this.row1, ...this.row2, ...this.row3];
    const found = pcs.find((pc)=> pc.ip == studentId && pc.label != pcLabel);
    return found;
  }

  inputEvent(event:any,pc:any){
    if(event.target.value.trim() == ''){
      return;
    }
    if(this.checkDuplicate(event.target.value.trim().replaceAll('\t','').replaceAll('\n',''), pc.label)){
      this.API.failedSnackbar('Duplicate Assignment!')
      pc.ip='';
      return;
    }
    if(this.checkIfAssignedOnOtherLab(event.target.value.trim().replaceAll('\t','').replaceAll('\n',''))){
      this.API.failedSnackbar(('This student is assigned to another lab!'))
      pc.ip='';
      return;
    }
    pc.ip =  event.target.value.trim().replaceAll('\t','').replaceAll('\n','');
  }

  async save(){
    // check all input is valid
    for(let pc of [...this.row1, ...this.row2, ...this.row3]){
      if(pc.ip.trim() != '' && this.getAssignedName(pc) == 'None' ){
        this.API.failedSnackbar(`${pc.label} contains invalid ID!`);
        return;
      }
    }
  if(this.speechLabs.length>0){
    this.API.justSnackbar('Updating Addresses...', 999999)
     for(let pc of  [...this.row1, ...this.row2, ...this.row3]){
      // if(){
        await this.API.changePCAddress(this.speechLabs[this.speechLabSelected].id, pc )
      // }
     }
     this.API.successSnackbar('Successfully updated addresses!')
     this.loadLabs();
    }else{
      this.API.failedSnackbar('There was an error loading speech labs');
    }
    
  }


  confirmEndClass() {
    Swal.fire({
      title: 'Are you sure?',
      text: 'Do you want to end the meeting?',
      icon: 'warning',
      showCancelButton: true,
      confirmButtonColor: '#3085d6',
      cancelButtonColor: '#d33',
      confirmButtonText: 'Yes, end it!'
    }).then((result) => {
      if (result.isConfirmed) {
        this.endClass();
      }
    });
  }
  
  
}