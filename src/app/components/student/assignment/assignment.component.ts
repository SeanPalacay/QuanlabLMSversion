import { Component, OnDestroy, OnInit, Renderer2 } from '@angular/core';
import { Router } from '@angular/router';
import { Subscription } from 'rxjs';
import { APIService } from 'src/app/services/API/api.service';
import { HostListener } from '@angular/core';
import Swal from 'sweetalert2';


@Component({
  selector: 'app-assignment',
  templateUrl: './assignment.component.html',
  styleUrls: ['./assignment.component.css']
})
export class AssignmentComponent implements OnInit, OnDestroy{
  timerActive: boolean = true; // Assuming you have a variable to track timer status
  tasks:any[] = [];
  quizPoints:Map<string,any> = new Map();
  showDescription: boolean = true;
  windowWidth: number = window.innerWidth;


  getAssignment$?:Subscription;
  getQuizzes$?:Subscription;
  getQuizPoints$?:Subscription;
  constructor(private router: Router, private API:APIService, private renderer: Renderer2,) {}




  truncateDescription(description: string, limit: number): string {
    const words = description.split(' ');
  
    if (this.windowWidth < 1000 && words.length > 7) {
      return words.slice(0, 7).join(' ') + '...';
    }
  
    if (words.length > limit) {
      return words.slice(0, limit).join(' ') + '...';
    }
  
    return description;
  }

    ngOnInit(): void {
      this.API.showLoader();
      this.getAssignment$ = this.API.studentGetAssignments().subscribe(data=>{
        const tasks:any= [];
        for(let task of  data.output){
          task.type = 'assignment';
          task.done = Number(task.done);
          task.deadline = this.parseDate(task.deadline);
          tasks.push(task);
        }
        this.getQuizzes$ =  this.API.studentGetQuizzes().subscribe(data=>{
          for(let task of  data.output){
            task.type = 'quiz';
            task.done = Number(task.done);
            task.deadline = this.parseDate(task.deadline);
            tasks.push(task);
            this.getQuizPoints$ =  this.API.studentQuizPoints().subscribe(data=>{
              for(let quiz of  data.output){
                this.quizPoints.set(quiz.assessmentid, quiz);
              }
            })
          }
          this.API.hideLoader();
          tasks.sort((b:any,a:any)=> new Date(a.time).getTime() - new Date(b.time).getTime() )
          this.tasks = tasks;
        })
      })

    

 
    }

  ngOnDestroy(): void {
      this.getAssignment$?.unsubscribe();
      this.getQuizzes$?.unsubscribe();
      this.getQuizPoints$?.unsubscribe();
      this.checkScreenWidth();
  }

  parseDate(date:string){
    return new Date(date).toDateString();
  }
  switchTag(type:string){
    switch(type){
      case 'assignment':
        return 'Assignment';
      case 'quiz':
        return 'Quiz';
      default:
        return 'Assignment';
    }
  }
  redirect(taskID:string) {
    this.router.navigate(['student/materials', {taskID: taskID}]);
  }

  attemptQuiz(task:any) {

    if(task.done){
      this.API.successSnackbar("This quiz is submitted!");
      return;
    }
    if(this.checkOverdue(task.deadline)) {
      this.API.failedSnackbar('This quiz is overdue and cannot be taken anymore.')
      return
    };

    Swal.fire({
      title: 'Ready?',
      text: 'Keep in mind that exiting fullscreen mode while answering will terminate your quiz!',
      icon: 'warning',
      confirmButtonColor: '#0172AF',
    }).then((value) => {
      if(value){
        this.API.quizID = task.id;
        this.router.navigate(['student/quiz-page']);
      }
    });
 
  }

  getQuizPoint(quizID:string){
    if(!this.quizPoints.has(quizID)) return null;
    const quiz = this.quizPoints.get(quizID);
    return quiz.takenpoints +'/' + quiz.totalpoints;
  }

  checkOverdue(date:string){
    const dateObject = new Date(date);
    return ((dateObject.getTime() - new Date().getTime())/(1000 * 3600 * 24))+1 < 0;
  }
  @HostListener('window:resize', ['$event'])
  onResize(event: any): void {
    this.windowWidth = event.target.innerWidth;
    this.checkScreenWidth(); // Check screen width on window resize
  }

  checkScreenWidth(): void {
    this.showDescription = this.windowWidth >= 500;
  }

}
