import { Component, OnDestroy, OnInit } from '@angular/core';
import { Location } from '@angular/common';
import { APIService } from 'src/app/services/API/api.service';
import { ActivatedRoute, Router } from '@angular/router';
import { PDFDocumentProxy } from 'ng2-pdf-viewer';

@Component({
  selector: 'app-practice1',
  templateUrl: './practice1.component.html',
  styleUrls: ['./practice1.component.css']
})
export class Practice1Component implements OnInit, OnDestroy {
  lessonData: any = null; // Declare a property to hold the lesson data and initialize it with null
  currentLessonIndex: number = 0; // Track the current lesson index

  constructor(private location: Location, private apiService: APIService, private route:ActivatedRoute, private router:Router) { }
  isTeacher = this.apiService.getUserType() == '1';
  // Method to redirect to the previous page
  redirectToOtherPage() {
    this.location.back();
    if(this.isTeacher){
      this.apiService.resetStudents();
    }
  }

  pdfBase:any;
  quizBase:any;
  contentLoaded = false

  audio:any;

  ngOnDestroy(): void {
    if(this.isTeacher){
      this.apiService.resetStudents();
    }
  }
  ngOnInit(): void {
    this.apiService.showLoader();
    const module =  this.route.snapshot.paramMap.get('m');
    this.audio = this.route.snapshot.paramMap.get('q');
    if(module){
      this.pdfBase = this.apiService.getURL(module);
    }
    if(this.audio){
      this.audio = this.apiService.getURL(this.audio);
    }
    
    // if(quiz){
    //   const obs = this.apiService.dictionary(quiz).subscribe(jsonQuiz=>{
    //     this.quizBase = jsonQuiz;
    //     console.log(this.quizBase);
    //     obs.unsubscribe();
    //   });
    // }
    // Call the API service to get lesson data
    this.apiService.getLessonData().subscribe(
      (data: any) => { // Explicitly define the type of 'data' as any
        this.lessonData = data; // Assign the fetched data to the property
      },
      (error: any) => { // Explicitly define the type of 'error' as any
        console.error('Error fetching lesson data:', error);
        // Handle error: You can set a default value, show a message to the user, etc.
      }
    );
  }

  totalPages = 0;
  currentPage = 1;
  afterLoadComplete(pdf: PDFDocumentProxy) {
    this.totalPages = pdf.numPages;
    this.contentLoaded = true;
    this.apiService.hideLoader();
  }
  
  proceedToQuiz(){
    this.router.navigate([ this.isTeacher ?'/teacher/speechlab/quiztemplate':'/student/speechlab/quiztemplate', {q:this.quizBase}])
  }

  prevPage(){
    if(this.currentPage > 1) this.currentPage -= 1;
  }
  nextPage(){
    if(this.currentPage < this.totalPages) this.currentPage +=1 ;
  }
  // Method to load the next lesson
  getParticipants(){
    return this.apiService.participantsAudio;
  }

  loadNextLesson() {
    // if(this.currentPage+1 < this.totalPages){
    //   this.currentPage +=1;
    // }
    if (this.lessonData && this.currentLessonIndex < this.lessonData.lessons.length - 1) {
      this.currentLessonIndex++;
    } else {
      console.log('No more lessons available');
    }
  }
}
  