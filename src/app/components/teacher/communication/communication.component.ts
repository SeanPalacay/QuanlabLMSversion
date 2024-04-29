    // communication.component.ts
import { Component, OnInit } from '@angular/core';
import { NgbModal } from '@ng-bootstrap/ng-bootstrap';
import { CreatemeetComponent } from '../modals/createmeet/createmeet.component';
import { APIService } from 'src/app/services/API/api.service';
import { Subscription } from 'rxjs';
import { trigger, state, style, animate, transition } from '@angular/animations';
import { environment } from 'src/environments/environment';

@Component({
    selector: 'app-communication',
    templateUrl: './communication.component.html',
    styleUrls: ['./communication.component.css'],
    animations: [
        trigger('fadeInOut', [
          state('void', style({
            opacity: 0
          })),
          transition('void <=> *', animate(300)),
        ]),
      ],
})
export class CommunicationComponent implements OnInit {
    showPage1: boolean = true;
    selectedlanguage:any;
    selectedcourse:any;
    selectedclass:any;
    languages:Array<any> = [];
    courses:Array<any> = [];
    classes:Array<any> =[];
    message: string = '';
    myMessage: string = '';
    user:any = this.API.getUserData();
    showModal = false;
    chatShowModal = false;


    ngOnInit(): void {
        this.API.getLanguages().subscribe(data=>{
            if(data.success){
                this.languages = data.output
            }
        });
        this.API.getClasses().subscribe(data=>{
          if(data.success){
            this.classes = data.output;
            if(this.API.getUserType()=='1'){
            }
          }
        });
        this.API.getConversations();
    }   

    comtypes = ['Urgent', 'Minor'];
    alertDesc:string = '';
    alertMessage: string = '';
    classToAlert:any = null;
    alertType = this.comtypes[0];
    sendAlert(){
      if(!this.API.checkInputs([this.alertDesc,this.alertMessage, this.alertType, this.classToAlert])){
        this.API.failedSnackbar('Please complete the fields before sending an alert.')
        return;
      }

      this.API.notifyStudentsInClass(
        `[ALERT]${this.alertType =='Urgent'? 'URGENT! ':''}${this.API.getFullName()} sent an alert to <b>${this.classToAlert.class}</b>! ${this.alertType =='Urgent'? '[Urgent]':''}`,
        `<div class='broadcast-message'>
        <div class='title'>🎉 ${this.alertDesc} 🎉</div>
        <div class='message'>${this.alertMessage}</div>
        <p class="text-sm mb-1 text-gray-500">${this.API.getFullName()}</p>
            <p class="text-sm">
              <b>${this.classToAlert.course}</b>
            </p>
        </div>`,
        // `[ALERT]${this.alertType =='Urgent'? 'URGENT! ':''}${this.API.getFullName()} sent an alert to <b>${this.classToAlert.class}</b>! ${this.alertType =='Urgent'? '[Urgent]':''}`,
        // `<b>Title: </b> ${this.alertDesc}<br><b>Content:</b> ${this.alertMessage}`,
        this.classToAlert.id
      );

      this.API.successSnackbar('Successfully sent an alert to class');

      this.alertDesc = '';
      this.alertMessage = '';

    }

    setAlertClass(_class:any){
      this.classToAlert = _class
    }

    setAlertType(type:string){
      this.alertType = type;
    }

    broadcast:string = '';
    broadcastContent: any = null;
    classToBroadcast:any = null;
    broadcastType = this.comtypes[0];
    sendBroadcast(){
      if(!this.API.checkInputs([this.broadcast,this.broadcastContent,this.broadcastType,this.classToBroadcast])){
        this.API.failedSnackbar('Please complete the fields before sending a broadcast.')
        return;
      }

      this.API.uploadFile(this.broadcastContent, this.broadcastContent.name)
      this.API.notifyStudentsInClass(
        `[BROADCAST]${this.broadcastType =='Urgent'? 'URGENT! ':''}${this.API.getFullName()} sent a broadcast to <b>${this.classToBroadcast.class}</b>! ${this.broadcastType =='Urgent'? '[Urgent]':''}`,
        `<div class='broadcast-message'>
        🎉 ${this.broadcast} 🎉<br><audio class='broadcast-audio' controls="controls" src ='${this.API.getURL('files/'+this.broadcastContent.name)}'></audio><br>
        <p class="text-sm mb-1 text-gray-500">${this.API.getFullName()}</p>
            <p class="text-sm">
              <b>${this.classToBroadcast.course}</b>
            </p>
        </div>`,
        this.classToBroadcast.id
      );
      this.API.successSnackbar('Sent broadcast!')

      this.broadcast = '';
      this.broadcastContent = null;

    }

    getBroadcastFilename(){
      return 'You attached a file : '+ this.broadcastContent.name
    }

    
    handleFileSelect(event:any){
      if(!event.target.files.length) return;
     this.broadcastContent=event.target.files[0]
    }

    setBroadcastClass(_class:any){
      this.classToBroadcast = _class
    }

    setBroadcastType(type:string){
      this.broadcastType = type;
    }







    getConvos(){
        return this.API.convos;
      } 

      openChatModal(person:any) {
        this.API.messages = [];
        if(person == null){
          this.chat = this.API.chat
          this.chatShowModal = true;
          return;
        }
        this.chat = person;
        this.API.chat = person;
        this.search = '';
        this.people = []
        this.API.getMessages(person.id);
        this.chatShowModal = true;
      }

      closeChatModal() {
        this.chat = null;
        this.API.chat = null;
        this.API.getConversations()
        this.chatShowModal = false;    
        
      }
    
      closeModal() {
        this.showModal = false;
    
      }

      closeModals() {
        this.closeModal();
        this.closeChatModal();
      }


      search$?:Subscription;
      people:any = []
      searching:boolean = false
      searchPeople(event:any){
        // if (event.key === "Enter") {
        //   this.addInterest(event.target.value);
        //   this.search = '';
        // }
        this.people =[];
        // if(this.interests.length>0) return;
        if(event.target.value.trim() == ''){
          return;
        }
        this.searching = true;
        this.search$?.unsubscribe();
        this.search$ =  this.API.searchPeople(event.target.value.trim().toLowerCase()).subscribe(data=>{
          this.searching = false;
          if(data.success){
            for(let person of data.output){
              person.lastseen = this.getTimeOnline(person.lastseen);
              this.people.push(person);
            }
          }
          this.search$?.unsubscribe();
        })
      }


      // end chat

      chat:any
      search:string = ''

      
  getTimeOnline(date:string){
    return this.API.parseDateFromNow(date);
  }

  getUrl(file:string){
    return this.API.getURL(file) ?? this.API.noProfile();
  }

        getMessages(){
            return this.API.messages
          }
        
          listening : any;
        
          sendMessageAnonymous(){
            if(this.message.trim() == '') return;
            this.API.socketSend({
              app:'quanlab',
              type : 'messaging',
              from: this.user.id,
              to: this.chat.id,
              message:this.message,
            })
            this.API.messages.push({
              senderid: this.user.id,
              recipientid : this.chat.id,
              message: this.message,
            })
            this.message = ''
          }
        
          sendMessage(){
            if(this.message.trim() == '') return;
            this.API.messages.push({
              senderid: this.user.id,
              recipientid : this.chat.id,
              message: this.message,
            })
            this.API.sendMessage(this.message,this.chat.id);
            if(this.chat.lastseen != 'Online'){
              this.API.pushNotifications(
                `${this.API.getFullName()} sent a message`,
                this.message,
                this.chat.id
              )
            }
            this.message = '';
          }
          interests:string[] = [];
          listen:boolean = false;
          searchByInterest(){
            this.listen = true;
            
            this.API.interests = this.interests;
            // listen for converstion events
            
            this.listening = setInterval(() => {
              this.API.socketSend(
                {
                  app:'quanlab',
                  type : 'omegle',
                  from:this.user.id,  
                  interests : this.API.interests
                }
              )
              if(this.API.chat !=null){
                this.listen = false;
                this.API.interests = [];
                // this.openChatModal(null);
                clearInterval(this.listening);
              }
            }, 1000);
          }
          cancelListen(){
            this.listen = false
            this.API.interests = [];
            clearInterval(this.listening);
          }
        
          addInterest(word:string){
            this.searching = false;
            if(this.interests.includes(word.toLowerCase().trim())) return;
            this.interests.push(word.toLowerCase().trim());
          }
        
          deleteInterst(index:number){
            this.interests.splice(index, 1);;
          }


      // end pa lalo kan chat

    checkHasContent(field:Array<any>){
        if(field.length <= 0){
            this.API.failedSnackbar('Field does not have any content.', 3000);
        }
    }
    getFirstLetters(name: string): string {
        const words = name.split(' ');
    
        // Check if there is more than one word
        if (words.length > 1) {
            const firstLetters = words.map(word => word.charAt(0));
            return firstLetters.join('');
        } else {
            // If there's only one word, return the whole word
            return name;
        }
    }
    checkDropdown(contents:any, message:string){
      if(contents.length <= 0){
        this.API.failedSnackbar(message);
      }
    }
    
    selectLanguage(language:any){
        this.selectedlanguage = language;
        console.log(language.id);
        this.API.getCoursesByLanguage(language.id).subscribe(data=>{
            if(data.success){
                this.courses = data.output
            }
        });
    }
    
    selectCourse(course:any){
        this.selectedcourse = course;
        this.API.teacherGetClassesByCourse(course.id).subscribe(data=>{
            if(data.success){
                this.classes = data.output
            }
        });
    }

    selectClass(selectedclass:any){
        this.selectedclass = selectedclass;
        this.API.setClass(this.selectedclass.id);
    }

    togglePages() {
        this.showPage1 = !this.showPage1;
    }

    constructor (private modalService: NgbModal, private API:APIService){}
    createMeet(){
      if(this.selectedclass == null){
        this.API.failedSnackbar('Please select a class.', 3000);
        return;
      }
      const modalRef = this.modalService.open(CreatemeetComponent);
    }




    

}
