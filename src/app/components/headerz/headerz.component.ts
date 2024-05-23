import { Component, ElementRef, Renderer2, OnInit, ChangeDetectorRef, OnDestroy } from '@angular/core';
import { APIService } from 'src/app/services/API/api.service';
import Swal from 'sweetalert2';
import { NgbModal, NgbModalOptions } from '@ng-bootstrap/ng-bootstrap';

import { ProblemreportComponent } from '../modals/problemreport/problemreport.component';
import { Router } from '@angular/router';
import { trigger, state, style, animate, transition } from '@angular/animations';
import { parse } from 'uuid';
import { environment } from 'src/environments/environment';
import { SurveyCertComponent } from '../student/modals/survey-cert/survey-cert.component';




@Component({
  selector: 'app-headerz',
  templateUrl: './headerz.component.html',
  styleUrls: ['./headerz.component.css'],
  animations: [
    trigger('openClose', [
      state('void', style({
        opacity: 0,
        marginLeft: '0px', 
      })),
      transition('void => *', [
        style({ opacity: 1, marginLeft: '-100px' }), 
        animate('300ms ease-in-out', style({ opacity: 1, marginLeft: '0px' })) 
      ]),
      transition('* => void', [
        animate('250ms ease-in-out', style({ opacity: 0.3, marginLeft: '-100px' })) 
      ]),
    ]),
  ],
  
  
})
export class HeaderzComponent implements OnInit, OnDestroy {

  isMenuVisible: boolean = false;
  profile?:string;
  search:string='';
  audio:HTMLAudioElement;

  reflectFullName(){
    return this.API.userData.firstname + " " + this.API.userData.lastname 
  }



  reflectProfile(){
    return this.API.getURL(this.API.userData.profile) ??this.API.noProfile();
  }

  toggleMenu(): void {
   
   this.isMenuVisible = !this.isMenuVisible;
  }
  
  hideSidebar(): void {
    this.isMenuVisible = false;
  }

  isSidebarMinimized: boolean = false;
  constructor(
    private API:APIService,
    private elRef: ElementRef,
    private renderer: Renderer2,
    private modalService: NgbModal,
    private router:Router,
    private cdf: ChangeDetectorRef,
    ){
    this.audio = new Audio();
    this.audio.src = 'assets/sounds/notif.mp3'
    this.audio.load();
  }


  showNotificationBox: boolean = false;

  // Function to toggle the visibility of the notification box
  toggleNotificationBox() {
    this.showNotificationBox = !this.showNotificationBox;
    // this.test();
  }

  notifications:any = [];
  newNotif:number = 0;
  getNotifications(muteCount?:boolean){  
    const obs$ =  this.API.getNotifications().subscribe(data=>{
      this.notifications = data.output;
      this.API.notifications = this.notifications;
      for(let notif of data.output){
        if(notif.status != 'seen'){
          this.API.inbox += 1;
        }
        if(notif.status == 'not_seen'){
          this.newNotif += 1;
        }
        // this.notifications.push(notif);
      }
      if(this.newNotif > 0 && !muteCount){
        this.API.successSnackbar(`You have ${this.newNotif} new notifications`)
        this.audio.play();
      }
      obs$.unsubscribe();
    })
  
  }

  
  getInbox(){
    return this.API.inbox
  }

  ngOnDestroy(): void {
   this.API.socket.close();
  }

  ngOnInit(): void {
    this.API.socket = new WebSocket(environment.socket);
    this.API.socket.binaryType = 'arraybuffer';
    this.API.socket.onopen = () => {
      this.API.socket!.onmessage = (message) => {
        var data = new TextDecoder('utf-8').decode(message.data);
        this.readMessage(data);
      };
    };

    this.API.userData = this.API.getUserData();
    this.getNotifications();
    switch (this.API.getUserData().accountType) {
      case 0:
        this.displayedItems = this.studentDashboardItems;
        break;
      case 1:
        this.displayedItems = this.teacherDashboardItems;
        break;
      case 2:
        this.displayedItems = this.adminDashboardItems;
        break;
      default:
        this.API.failedSnackbar('System Error');
    }
  
    this.itemKeys = Object.keys(this.displayedItems);
  
    const body: HTMLElement = this.elRef.nativeElement;
    const sidebar: HTMLElement = body.querySelector('nav') as HTMLElement;
    const burger: HTMLElement = body.querySelector('.nav') as HTMLElement;
    const toggle: HTMLElement = body.querySelector('.toggle') as HTMLElement;
    this.renderer.addClass(document.body, 'custom:ml-64');
  
    toggle.addEventListener('click', () => {
      sidebar.classList.toggle('close');
  
      const toggleIcon: HTMLElement = body.querySelector('.bx-chevron-right.toggle') as HTMLElement;
      toggleIcon.classList.toggle('rotate');
  
      const transitionDuration = 300;
      this.renderer.setStyle(
        document.body,
        'transition',
        `margin-left ${transitionDuration}ms ease-in-out`
      );
  
      if (sidebar.classList.contains('close')) {
        this.renderer.removeClass(document.body, 'custom:ml-64');
        this.renderer.addClass(document.body, 'custom:ml-20');
      } else {
        this.renderer.removeClass(document.body, 'custom:ml-20');
        this.renderer.addClass(document.body, 'custom:ml-64');
      }
  
      this.isSidebarMinimized = !this.isSidebarMinimized;
    });


     burger.addEventListener('click', () => {
      sidebar.classList.toggle('nav');
  
      const burgerButton: HTMLElement = body.querySelector('.bx-chevron-right.toggle') as HTMLElement;
      burgerButton.classList.toggle('rotate');
  
      const transitionDuration = 300;
      this.renderer.setStyle(
        document.body,
        'transition',
        `margin-left ${transitionDuration}ms ease-in-out`
      );
  
      if (sidebar.classList.contains('nav')) {
        this.renderer.removeClass(document.body, 'custom:ml-64');
        this.renderer.addClass(document.body, 'custom:ml-20');
      } else {
    this.renderer.removeClass(document.body, 'custom:ml-20');
        this.renderer.addClass(document.body, 'custom:ml-64');
      }
  
      this.isSidebarMinimized = !this.isSidebarMinimized;
    });
  }
  
  confirmBox() {
    Swal.fire({
      title: 'Are you sure want to Logout?',
      text: 'You will be redirected to login',
      icon: 'warning',
      confirmButtonColor: 'rgb(116, 254, 189)',
      cancelButtonColor: '#7F7F7F',
      showCancelButton: true,
      confirmButtonText: 'Logout!',
      cancelButtonText: 'Cancel',
    }).then((result) => {
      if (result.value) {
        Swal.fire({
          title: 'Logout Successfully!',
          text: 'Thank you for your time. :)',
          icon: 'success',
          confirmButtonColor: '#0172AF', // Replace 'yourColor' with your preferred color
        }).then(() => {
          this.logout();
          this.renderer.removeClass(document.body,'custom:ml-20'); 
          this.renderer.removeClass(document.body,'custom:ml-64'); // Remove the margin-left style
        });
      } else if (result.dismiss === Swal.DismissReason.cancel) {
        Swal.fire({
          title: 'Cancelled',
          text: 'We are happy you stayed :)',
          icon: 'error',
          confirmButtonColor: '#0172AF', // Replace 'yourColor' with your preferred color
        });
      }
    });
  }

  navigate(location: string): void {
    this.hideSidebar();
    this.router.navigate([location]);
  }
  

  gotoProfile(){
    if(this.API.getUserType() == '0'){
      this.navigate('student/studentProfile');
    }
    if(this.API.getUserType() == '1'){
      this.navigate('teacher/teacherProfile');
    }
    if(this.API.getUserType() == '2'){
      this.navigate('admin/adminProfile');
    }

  }

  logout() {
    this.renderer.removeClass(document.body, 'min-[768px]:ml-64'); // Remove the margin-left style
    this.API.logout(); // Call the logout method from your API service
  } 
  

  openModal() {
    const modalRef = this.modalService.open(ProblemreportComponent);
    // You might pass data or perform any other operations here.
  }

  studentDashboardItems = {
    DASHBOARD: {
      redirect: 'student/dashboard',
      icon: 'bx-border-all',
    },
    LAB: {
      redirect: 'student/lab',
      icon: 'bx-extension',
    },
    MEET: {
      redirect: 'student/quanhub',
      icon: 'bx-video',
    },

    TASKS: {
      redirect: '/student/to-do',
      icon: 'bx-notepad',
    }
  };

  teacherDashboardItems = {
    'DASHBOARD' : {
      redirect: "teacher/dashboard",
      icon : 'bx-border-all',
      routerLink:"/teacher/dashboard"
    },
   
    "MANAGE COURSES" : {
      redirect: "teacher/managecourse",
      icon : 'bx-book-reader',
      routerLink:"/teacher/managecourse"
    },
    "MANAGE CLASS" : {
      redirect: "teacher/manageclass",
      icon : 'bx-chalkboard',
      routerLink:"/teacher/manageclass"
    },
    "MEET": {
      redirect: 'teacher/quanhub',
      icon : 'bx-video',
      routerLink: '/teacher/quanhub'
    },
    GRADES: {
      redirect: 'teacher/grade-list',
      icon: 'bx-spreadsheet',
      routerLink: '/teacher/grade-list',
    }
  }

  adminDashboardItems = {
    'DASHBOARD' : {
      redirect: "admin/dashboard",
      icon : 'bx-border-all'
    },
    'USERS':{
      redirect: 'admin/users',
      icon : 'bx-user'
    }
  }
  

  displayedItems: any;
  itemKeys: any;

  checkAccount(){
    return this.API.getUserType();
  }

  activateSearch(){
    // this.API.pushNotifications('Test','TEST TEST', this.API.userData.id)
  }  
  userType = this.API.getUserType();
  routes = [
    {for:'0', name:'Go to Assignments', link: '/student/to-do'},
    {for:'0', name:'Go to Quizzes', link: '/student/to-do'},
    {for:'0', name:'Go to Text-to-Speech', link: '/student/texttospeech'},
    {for:'0', name:'Go to Courses', link: '/student/courses'},
    {for:'0', name:'Go to Lessons', link: '/student/courses'},
    {for:'0', name:'Go to Dashboard', link: '/student/dashboard'},
    {for:'0', name:'Go to Meet', link: '/student/quanhub'},
    {for:'0', name:'Go to Self Study', link: '/student/selfstudylab'},
    {for:'0', name:'Go to Practice', link: '/student/selfstudylab'},
    {for:'0', name:'Go to Dictionary', link: '/student/dictionary'},
    {for:'0', name:'Go to Profile', link: '/student/studentProfile'},
    {for:'0', name:'Go to Messages', link: '/student/dashboard'},
    {for:'0', name:'Go to Speechlab', link: '/student/speechlab'},

    {for:'1', name: 'Go to Manage Courses', link:'/teacher/managecourse'},
    {for:'1', name: 'Go to Manage Class', link:'/teacher/manageclass'},
    {for:'1', name: 'Go to Quizzes', link:'/teacher/quiz-management'},
    {for:'1', name: 'Go to Tasks', link:'/teacher/task-management'},
    {for:'1', name: 'Go to Grades', link:'/teacher/grade-list'},
    {for:'1', name: 'Go to Text-to-Speech', link:'/teacher/texttospeech'},
    {for:'1', name: 'Go to Profile', link:'/teacher/teacherProfile'},
    {for:'1', name: 'Go to Profile', link:'/teacher/teacherProfile'},
    {for:'1', name: 'Go to Messages', link:'/teacher/communication'},
    {for:'1', name: 'Go to Alert', link:'/teacher/communication'},
    {for:'1', name: 'Go to Broadcast', link:'/teacher/communication'},
    {for:'1', name:'Go to Meet', link: '/teacher/quanhub'},
    {for:'1', name:'Go to Speechlab', link: '/teacher/speechlab'},
  ];
  searchbar = '';
  handleSearchInput(event:any){
    this.API.search = event.target.value;
    this.searchbar = this.API.search;
  }

  has(word:string,search:string){
    return word.trim().toLowerCase().includes(search.trim().toLowerCase())
  }

  goTo(route:string){
    this.router.navigate([route]);
    this.searchbar = '';
  }

  readMessage(data:any){
    // return //-- comment out pag inuyaman
    const parsedMessage = JSON.parse(data);
    if(parsedMessage.app != 'quanlab'){
      return;
    }

    if(parsedMessage.type == 'notification' && this.API.getUserType() =='2' && parsedMessage.to == '[--administrator--]'){
      // if(this.API.chat.id != parsedMessage.from){
        this.getNotifications(true);
        this.API.verificationNotifier.next(1);
        this.audio.play();
        if(parsedMessage.title.toLowerCase().includes('verification') && parsedMessage.sender == 'Anonymous'){
          this.API.successSnackbar('New verification request');
        }else{
          this.API.successSnackbar(`New notification from ${parsedMessage.sender}`, 5000);
        }
        return
      }
    if(parsedMessage.to == this.API.getUserData().id){
      if(parsedMessage.type == 'notification'){
        // if(this.API.chat.id != parsedMessage.from){
          this.getNotifications(true);
          this.audio.play();
          this.API.successSnackbar(`New notification from ${parsedMessage.sender}`, 5000);
        }
      if(parsedMessage.type == 'messaging'){
        // console.log(this.API.chat)
        // console.log(parsedMessage)
        if(this.API.chat?.id == parsedMessage.from){
          this.API.messages.push({
            senderid: parsedMessage.from,
            recipientid : parsedMessage.to,
            message: parsedMessage.message,
          })
          this.API.messsagesMarkAllAsRead(this.API.chat.id);
        }else{
          this.API.getConversations();
          this.API.successSnackbar(`You have a message from ${parsedMessage.sender}`, 5000);
        }
      }
      if(parsedMessage.type == 'omegle-request-handhsake'){
        if(!parsedMessage.interests.length) return;
        this.API.chat = {
          firstname : 'Say',
          lastname: 'Hi!',
          id : parsedMessage.from,
          anonymous:true,
          // interests: parsedMessage.interests.filter((x:string) => this.API.interests.includes(x))
          interests: parsedMessage.interests
        }
        
         this.API.interests = [];
         this.API.socketSend(
           {
             app:'quanlab',
             type : 'omegle-accept-handhsake',
             from:parsedMessage.to,  
             to : parsedMessage.from,
             interests: parsedMessage.interests
           }
         )
       }
       
   
       
       if(parsedMessage.type == 'omegle-accept-handhsake'){
        if(!parsedMessage.interests.length) return;
         this.API.chat = {
           firstname : 'Say',
           lastname: 'Hi!',
           id : parsedMessage.from,
           anonymous:true,
          //  interests: parsedMessage.interests.filter((x:string) => this.API.interests.includes(x))
           interests: parsedMessage.interests
          }
          this.API.interests = [];
       }

       if(parsedMessage.type == 'omegle-terminate-handhsake'){
        this.API.chat = null;
        this.API.failedSnackbar('Person disconnected from chat.')
      }
      
    }

    if(parsedMessage.type == 'omegle'){
      const interests = parsedMessage.interests.filter((x:string) => this.API.interests.includes(x));
      if(interests.length){
        this.API.socketSend(
          {
            app:'quanlab',
            type : 'omegle-request-handhsake',
            from: this.API.getUserData().id,  
            to : parsedMessage.from,
            interests: interests
          }
        )
      }
      // for(let interest of parsedMessage.interests){
      //   if(this.API.interests.length <=0) break;
      //   if(this.API.interests.includes(interest)){
          
      //     break;
      //   }
      // }
    }

   



  
    
    // if(parsedMessage.to != null ){
    //   if( parsedMessage.to == this.API.getUserData().id){
    //     this.audio.play();
    //     this.API.successSnackbar(parsedMessage.message, 5000);
    //   }
    //   return;
    // }

    // if(parsedMessage.color!=null){
    //   const colors = ['red', '#508D69','#0172AF', '#F3B664','#bccdd6','rgb(233, 150, 164)'];
    //   const colorscomplement = ['orange', '#9ADE7B','#74FEBD','#FAEF9B', '#FAEED1', 'pink']
    //   document.documentElement.style.setProperty('--primary-color', colorscomplement[parsedMessage.color]);
    //   document.documentElement.style.setProperty('--secondary-color', colors[parsedMessage.color]);
    //   document.documentElement.style.setProperty('--snackbar-color', colors[parsedMessage.color]);
    //   document.documentElement.style.setProperty('--snackbar-color-text', 'white');
    //   this.API.justSnackbar(parsedMessage.message);
    //   this.audio.play();
    //   return;
    // }
    // if(parsedMessage.message == null){
    //   return;
    // }
    
  }
}
