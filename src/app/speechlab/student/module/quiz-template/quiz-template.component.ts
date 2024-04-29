import { Component, OnDestroy, OnInit } from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';
import { APIService } from 'src/app/services/API/api.service';
import { MatSnackBar } from '@angular/material/snack-bar';
import { Location } from '@angular/common';

@Component({
  selector: 'app-quiz-template',
  templateUrl: './quiz-template.component.html',
  styleUrls: ['./quiz-template.component.css']
})
export class QuizTemplateComponent implements OnInit, OnDestroy {
  constructor(
    private apiService: APIService,
    private route: ActivatedRoute,
    private router: Router,
    private snackBar: MatSnackBar,
    private location: Location
  ) {}
  
  newverb: any;
  quizBase: any;
  questions: any[] = [];
  currentQuestionIndex = 0;
  showResults = false;
  correctAnswers = 0;

  ngOnDestroy(): void {
    this.apiService.currentLabLesson = false;
  }

  ngOnInit(): void {
    if(!this.apiService.currentLabLesson){
      this.router.navigate(['/student/speechlab/modules']);
      return;
    }
    
    const quiz = this.route.snapshot.paramMap.get('q');
    if (quiz) {
      console.log(this.apiService.getURL(quiz));
      const obs = this.apiService.dictionary(quiz).subscribe((jsonQuiz) => {
        this.quizBase = jsonQuiz;
        this.questions = this.quizBase.story;
        this.newverb = this.quizBase.verbs;
        obs.unsubscribe();
      });
    }
  }

  selectOption(option: string): void {
    this.questions[this.currentQuestionIndex].selectedOption = option;
  }

  nextQuestion(): void {
    if (this.currentQuestionIndex < this.questions.length - 1) {
      this.currentQuestionIndex++;
    } else {
      this.showResults = true;
      this.calculateScore();
    }
  }

  previousQuestion(): void {
    if (this.currentQuestionIndex > 0) {
      this.currentQuestionIndex--;
    }
  }

  submitQuiz(): void {
    const message = "Are you sure you want to submit the quiz?";
    const action = "Confirm";
    const durationInSeconds = 5; // Adjust the duration as needed
  
    const snackbarRef = this.snackBar.open(message, action, {
      duration: durationInSeconds * 1000 // Convert duration to milliseconds
    });
  
    snackbarRef.onAction().subscribe(() => {
      this.calculateScore();
      this.apiService.recordLabQuiz((this.apiService.currentLabLesson as string), this.correctAnswers, this.questions.length);
      this.showResults = true;
    });
  }

  calculateScore(): void {
    this.correctAnswers = this.questions.filter(
      (q) => q.selectedOption === q.correctOption
    ).length;
  }

  navigateToOtherPage() {
    this.router.navigate(['/student/speechlab/modules']); // Replace '/other-page' with the actual route you want to navigate to
  }


// QUIZ type Drag and drop

score = 0;
dragged = 0;

filledTiles: Set<string> = new Set();


onDrop(event: any, word: string) {
  event.preventDefault();
  const target = event.target as HTMLElement;

  if (target instanceof HTMLElement && target.textContent !== null) {
    const draggedVerb = event.dataTransfer.getData('text/plain');

    // Check if the target is a drop target, not already filled, and the verb hasn't been dropped yet
    if (this.newverb.includes(draggedVerb) && target.textContent.trim() === '' && !this.filledTiles.has(draggedVerb)) {
      target.textContent = draggedVerb;
      console.log(this.questions.length, this.filledTiles.size);
      // Check if the filled text is correct
      if (target.textContent === draggedVerb) {
        this.removeVerb(draggedVerb);
        this.dragged +=1;
        if (target.id === draggedVerb) {

          // Correct drag
          this.score += 1;
          this.filledTiles.add(draggedVerb); // Add the verb to the set of filled tiles

          target.style.border = '2px solid #4CAF50'; // Green border
          target.style.width = 'auto';
        } else {
          // Incorrect drag
          target.style.border = '2px solid #FF0000'; // Red border
          target.style.width = 'auto';
          
        }
        if(this.dragged >= this.questions.length){
          this.apiService.recordLabQuiz((this.apiService.currentLabLesson as string), this.score, this.questions.length);
        }
      }
      
    }
  }
}


  removeVerb(verb: string) {
    const index = this.newverb.indexOf(verb);
    if (index !== -1) {
      this.newverb.splice(index, 1);
    }
  }

  onDragStart(event: any, verb: string) {
    if (!this.filledTiles.has(verb)) {
      event.dataTransfer.setData('text/plain', verb);
    } else {
      event.preventDefault();
    }
  }

  allowDrop(event: any, word: any) {
    event.preventDefault();
    const target = event.target as HTMLElement;
  
    // Check if the span is not null, not filled, and not the same span
    // Add a visual indication that it's a droppable area
    // Only allow drop if the span is empty and not the same span
    if (target.textContent && !target.textContent.trim() && event.dataTransfer.getData('text/plain') !== target.id) {
      target.style.border = '2px dashed #008CBA'; 
    }
    
  }
  goBack(): void {
    this.location.back();
  }
}
