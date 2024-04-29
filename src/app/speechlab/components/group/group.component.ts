
import { Component, ElementRef, EventEmitter, Input, Output, ViewChild } from '@angular/core';
import { NgbActiveModal } from '@ng-bootstrap/ng-bootstrap';
import { VideoSDK } from '@videosdk.live/js-sdk';
import { APIService } from 'src/app/services/API/api.service';
import { MessageObject, ParticipantObject } from "src/app/shared/model/models";
import { environment } from 'src/environments/environment';

@Component({
  selector: 'app-group',
  templateUrl: './group.component.html',
  styleUrls: ['./group.component.css']
})
export class GroupComponent {
getURL(arg0: string) {
throw new Error('Method not implemented.');
}
  solo= false;
  choosenSolo: any;
  groupings= false;
  groupingItems: any[] = [];
  layout= true;
  maxGrouping: number = 2; 
  groupColor: string = '';
  editedLayout = false;
  soloButton: boolean = false;
  editedLayoutGroupings = false;
  startMeet = false;
  isChatModalOpen = false;



  



  constructor(private API:APIService) {
    
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
    this.particpantID = user.id;
    this.profile = user.profile;
    this.participantType = this.API.getUserType();
  
    if (this.participantType === '1') {
      this.teacherName = this.participantName;
      this.API.endMeeting(this.particpantID!).subscribe();
      if (this.API.joinWithCamera !== undefined && this.API.joinWithCamera !== null) {
        this.isWebCamOn = this.API.joinWithCamera;
        this.isMicOn = this.API.joinWithMic!;
        this.API.resetMeetOptions();
        this.startClass();
      }
    }
  
    [this.row1, this.row2, this.row3] = await this.API.loadComputers();
    this.loadStudents();
    this.loadLabs();
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
 profile?:string;

 



 clearInput(){
  this.messageInput!.nativeElement.value = '';
  this.message = '';
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
    this.layout = false;
    this.soloButton = true;
    this.groupings = false;
    this.editedLayoutGroupings = false
    this.editedLayout = false;
  }

  
  openGroupings() {
    this.groupings = true;
    this.layout = false;
    this.editedLayoutGroupings = false;
    this.editedLayout = false;
    this.solo = false;
    this.choosenSolo = false;
    
  }

  saveSolo() {
    this.solo = false;
  
    this.editedLayout = true;

  }

  closeSolo() {
    this.solo = false;
    this.layout = true;
  }

  

  soloGropings(item:any ) {
    this.choosenSolo = item;
  }

  
  startClass() {
    this.startMeet = !false;
  }

  // saveGroupings(color: string) {
  //   this.groupColor = color;
  //   this.groupings = true;
  // }

  confirmSave() {
    this.groupings = false;
    this.editedLayoutGroupings = true;
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
      }
    } else {
      this.groupingItems.splice(index, 1);
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

  selectLab(index:number){
    this.speechLabSelected = index;
    this.loadAssignedAddresses();
  }

  loadedAddresses:Map<string,any>= new Map();

  loadAssignedAddresses(){
    if(this.speechLabs.length > 0){
      const obs$ = this.API.loadComputerAddresses().subscribe(data=>{
        if(data.success){
          const assignMap = new Map<string,any>( data.output.filter((e:any)=>e.labid == this.speechLabs[this.speechLabSelected].id).map((entry:any)=> [entry.name, entry]))
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
    const student = this.students.find((student)=> student.visibleid == pc.ip);
    if(student){
      return `${student.firstname} ${student.lastname}`;
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

  
}