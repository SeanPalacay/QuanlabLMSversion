import { AfterViewChecked, Component, ElementRef, OnInit, ViewChild } from '@angular/core';
import { Router } from '@angular/router';
import { APIService } from 'src/app/services/API/api.service';
import { trigger, state, style, animate, transition } from '@angular/animations';
import { Subscription } from 'rxjs';


@Component({
  selector: 'app-home',
  templateUrl: './home.component.html',
  styleUrls: ['./home.component.css'],
  animations: [
    trigger('fadeInOut', [
      state('void', style({
        opacity: 0
      })),
      transition('void <=> *', animate(300)),
    ]),
  ],
})
export class HomeComponent implements OnInit, AfterViewChecked {
  @ViewChild('scrollMessages') myScrollContainer?: ElementRef;
  message: string = '';
  myMessage: string = '';
  showModal = false;
  chatShowModal = false;
  courses:Map<string,any> = new Map();
  user:any = this.API.getUserData();
  constructor(private API:APIService, private router:Router){}
  ngOnInit(): void {
    // loading = true;
    this.API.showLoader();
    this.API.getEnrolledCourses().subscribe(res=>{
       // loading = false;
      if(res.success){
        if(res.output.length){
          for(let course of res.output){
            this.API.getCourseProgress(course.id).subscribe(data=>{
              if(data.success){
                var progress = 0;
                if(data.output[0].sum != null && data.output[0].lessons != null){
                  progress = Number((Number(data.output[0].sum) / (Number(data.output[0].lessons) * 100)).toFixed(4))*100;
                }
                var courseObj = course;
                courseObj.progress = progress;
                this.courses.set(course.id, courseObj);
              }else{
                this.API.failedSnackbar('Error fetching courses.')
              }
              this.API.hideLoader();
            })
          }
        }else{
          this.API.hideLoader();
        }
        
      }else{
        this.API.failedSnackbar('Error connecting to the server.' , 3000);
      }

    });
   this.API.getConversations();
  }

  cleanTags(notif:string){
    return notif.replace('[Urgent]', '').replace('[BROADCAST]','').replace('[ALERT]', '');
  }

  getConvos(){
    return this.API.convos;
  }
  lastChats:number = 0;

  ngAfterViewChecked(): void {
    if(this.lastChats == this.getMessages().length) return;
    this.scrollToBottom();
  }

  scrollToBottom(): void {
    try {
        this.myScrollContainer!.nativeElement.scrollTop = this.myScrollContainer!.nativeElement.scrollHeight;
    } catch(err) { }                 
}

  
getNotifications(){
   return this.API.notifications;
}


isBroadcastAlert(notif:string){
  return notif.includes('[BROADCAST]') || notif.includes('[ALERT]')

}
isUrgent(notif:string){
  return notif.includes('[Urgent]')
}

  openCourse(courseID:string){
    this.API.setCourse(courseID);
    this.router.navigate(['/student/lessons'] );
  }

  openModal() {
    this.showModal = true;
  }
  chat:any
  search:string = ''
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

  getMessages(){
    return this.API.messages
  }

  listening : any;

  sendMessageAnonymous(){
    console.log(this.API.chat);
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
    if(this.chat.lastseen != 'Just now' && this.chat.lastseen != '1 minute ago' ){
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
      if(this.API.chat !=null){
        this.listen = false;
        this.API.interests = [];
        this.openChatModal(null);
        clearInterval(this.listening);
      }
      this.API.socketSend(
        {
          app:'quanlab',
          type : 'omegle',
          from:this.user.id,  
          interests : this.API.interests
        }
      )   
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
    if(this.listen) return;
    this.interests.splice(index, 1);;
  }

  checkOpenModal(){
    return this.API.chat != null && this.chatShowModal
  }
  
  closeChatModal() {
    if(this.chat.anonymous){
      this.API.socketSend({
        app:'quanlab',
        type : 'omegle-terminate-handhsake',
        from: this.user.id,
        to: this.chat.id,
      })
    }
    this.chat = null;
    this.API.chat = null;
    this.API.getConversations()
    this.chatShowModal = false;    
    
  }

  closeModal() {
    this.showModal = false;

  }

  getTimeOnline(date:string){
    return this.API.parseDateFromNow(date);
  }

  getUrl(file:string){
    return this.API.getURL(file) ?? this.API.noProfile();
  }

  search$?:Subscription;
  people:any = []
  searching:boolean = false
  searchPeople(event:any){
    this.people =[];
    if(event.target.value.trim() == ''){
      return;
    }
    if (event.key === "Enter") {
      this.addInterest(event.target.value);
      this.search = '';
    }
    if(this.interests.length>0) return;
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

  closeModals() {
    this.closeModal();
    this.closeChatModal();
  }


}
