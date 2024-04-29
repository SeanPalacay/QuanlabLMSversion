import { Component, OnInit } from '@angular/core';
import { Location } from '@angular/common';
import { APIService } from 'src/app/services/API/api.service';
import { ActivatedRoute, Router } from '@angular/router';
import { PDFDocumentProxy } from 'ng2-pdf-viewer';

@Component({
  selector: 'app-learning-modules',
  templateUrl: './learning-modules.component.html',
  styleUrls: ['./learning-modules.component.css']
})
export class LearningModulesComponent implements OnInit {
  lessonData: any = null; // Declare a property to hold the lesson data and initialize it with null
  currentLessonIndex: number = 0; // Track the current lesson index

  constructor(private location: Location, private apiService: APIService, private route:ActivatedRoute, private router:Router) { }

  // Method to redirect to the previous page
  redirectToOtherPage() {
    this.location.back();
  }

  pdfBase:any;
  quizBase:any;
  contentLoaded = false
  disableAttempt = false;
  attempt:any;
  ngOnInit(): void {
    
    this.apiService.showLoader();
    if(!this.apiService.currentLabLesson){
      this.router.navigate(['/student/speechlab/modules']);
      return;
    }
    const module =  this.route.snapshot.paramMap.get('m');
    this.quizBase = this.route.snapshot.paramMap.get('q');
    if(module){
      this.pdfBase = this.apiService.getURL(module);
    }
    const obs= this.apiService.checkStudentLabAttempt().subscribe(data=>{
      if(data.success){
        if(data.output.length>0){
          this.disableAttempt = true;
          this.attempt = data.output[0];
        }
      }
      obs.unsubscribe();
    })
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
    this.router.navigate([ this.apiService.getUserType() == '1'? '/teacher/speechlab/quiztemplate' : '/student/speechlab/quiztemplate', {q:this.quizBase}])
  }

  prevPage(){
    if(this.currentPage > 1) this.currentPage -= 1;
  }
  nextPage(){
    if(this.currentPage < this.totalPages) this.currentPage +=1 ;
  }
  // Method to load the next lesson


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
  