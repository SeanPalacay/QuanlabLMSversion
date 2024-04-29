import { Component, ElementRef, HostListener, OnDestroy, OnInit, ViewChild } from '@angular/core';
import { Location } from '@angular/common';
import { APIService } from 'src/app/services/API/api.service';
import { Subscription } from 'rxjs';


@Component({
  selector: 'app-lab-vids',
  templateUrl: './lab-vids.component.html',
  styleUrls: ['./lab-vids.component.css']
})
export class LabVidsComponent implements OnInit, OnDestroy {
  @ViewChild('videoElement') videoElement!: ElementRef;
  @HostListener('document:fullscreenchange')

  private quizDataSubscription: Subscription | undefined;

  choicesSets : any[] = [];
  score: number = 0;
  selectedOption: string | null = null;

  isFullScreen: boolean = false;
  isEnded: boolean = false

  isCorrect: boolean | null = null;
  showChoices: boolean = true; // Flag to control the visibility of choices
  
  showModalForm: boolean = false;
  closeForm: boolean = false;

  currentChoicesIndex: number = 0;
  currentChoices = this.choicesSets[this.currentChoicesIndex];

  constructor(private location: Location, private quizService: APIService) {}

  ngOnInit(): void {
    this.quizDataSubscription = this.quizService.getQuizData().subscribe({
      next: (data) => {
        this.choicesSets = data.choicesSets;
        // Initialize component properties after data is loaded
        this.initializeComponentProperties();
      },
      error: (error) => {
        console.error('Error fetching quiz data:', error);
      }
    });
  }

  ngOnDestroy(): void {
    this.quizDataSubscription?.unsubscribe();
  }

  initializeComponentProperties(): void {
    this.selectedOption = null;
    this.isCorrect = null;
    this.showChoices = true;
    this.showModalForm = false;
    this.closeForm = false;
    this.score = 0;
    this.currentChoicesIndex = 0;
    this.currentChoices = this.choicesSets[this.currentChoicesIndex];
  }

  
  onVideoPlay() {
    if (!this.isFullScreen) {
      
      const video = this.videoElement.nativeElement as HTMLVideoElement;
      
      video.requestFullscreen().then(() => {
        
        // video.controls = false
        video.play(); // Autoplay after entering fullscreen
      }).catch(error => {
        console.log('Request fullscreen failed:', error);
      });
    } else {
      document.exitFullscreen();
    }
    
    
  }

  onVideoEnded() {
    document.exitFullscreen(); // Exit fullscreen when video ends
    this.isEnded = true
  }

  handleValidation = () => {
    const selectedChoice = this.currentChoices.choices.find((choice:any) => choice.value === this.selectedOption);
    this.isCorrect = selectedChoice ? selectedChoice.isCorrect : false;
    
    if (this.isCorrect) {
      this.score++;
    }

    setTimeout(() => {
      this.isCorrect = null;
    }, 2000);

  // Check if this is the last set of choices
  const currentIndex = this.choicesSets.findIndex(set => set === this.currentChoices);
  if (currentIndex === this.choicesSets.length - 1) {
    
    setTimeout(() => {
      this.showModalForm = true;
    }, 1000);

   
    
  } else {
    setTimeout(() => {
      // Reset form and switch to the next set of choices
      this.selectedOption = null;
      this.currentChoices = this.choicesSets[currentIndex + 1]; // Switch to the next set
    }, 2000); 
  }
    
    
  }

  closeModal = () => {
    this.closeForm = true;
  }

  redirectToOtherPage() {
    this.location.back();
  }
  
}

 

  