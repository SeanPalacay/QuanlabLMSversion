import { Component, AfterViewInit, ElementRef, Renderer2, ViewChild, HostListener } from '@angular/core';
import { Router } from '@angular/router'; // Import Router

@Component({
  selector: 'app-intro',
  templateUrl: './intro.component.html',
  styleUrls: ['./intro.component.css']
})
export class IntroComponent implements AfterViewInit {
  private zSpacing: number = -1000;
  private lastPos: number = this.zSpacing / 5;
  private zVals: number[] = [];
  private galers: Element[] = [];

  @ViewChild('audioPlayer') audioPlayer!: ElementRef<HTMLAudioElement>;
  @ViewChild('rootElement') rootElement!: ElementRef; // Reference to the root element

  // Add the 'toggleSound' property
  public toggleSound: boolean = true; // Start with sound enabled

  constructor(private renderer: Renderer2, private el: ElementRef, private router: Router) {}

  ngAfterViewInit(): void {
    this.galers = Array.from(this.el.nativeElement.getElementsByClassName('galer'));
    this.galers.forEach((_, i) => this.zVals.push((i * this.zSpacing) + this.zSpacing));
    setTimeout(() => window.scrollTo(0, 1));
    this.initializeAudioControls();
    this.muteVideo();
    this.createAudioElement();
    this.renderer.addClass(this.rootElement.nativeElement, 'fade-in');
  }

  createAudioElement(): void {
    const audio = this.audioPlayer.nativeElement;
    audio.src = 'assets/media/po.mp3';
    audio.loop = true;

    if (this.toggleSound) {
      audio.play()
        .catch(() => console.log('Audio play failed - user interaction required'));
    }
  }

  muteVideo(): void {
    const videos: HTMLVideoElement[] = this.el.nativeElement.querySelectorAll('video');
    videos.forEach(video => video.muted = true);
  }

  initializeAudioControls(): void {
    const soundButton = this.el.nativeElement.querySelector('.soundbutton');

    this.renderer.listen(soundButton, 'click', (event) => {
      event.preventDefault();
      // Toggle the 'toggleSound' property
      this.toggleSound = !this.toggleSound;

      const audio = this.audioPlayer.nativeElement;

      if (this.toggleSound) {
        audio.play()
          .catch(() => console.log('Audio play failed - user interaction required'));
        localStorage.setItem('audioPlayed', 'true');
        this.renderer.removeClass(soundButton, 'paused');
      } else {
        audio.pause();
        localStorage.setItem('audioPlayed', 'false');
        this.renderer.addClass(soundButton, 'paused');
      }
    });
  }
  toggleAudio(): void {
    const audio = this.audioPlayer.nativeElement;

    if (this.toggleSound) {
      audio.pause();
      this.toggleSound = false;
      localStorage.setItem('audioPlayed', 'false');
    } else {
      audio.play();
      this.toggleSound = true;
      localStorage.setItem('audioPlayed', 'true');
    }
  }
  @HostListener('window:scroll')
  onWindowScroll(event:any): void {
    let top = document.documentElement.scrollTop;
    let delta = this.lastPos - top;
    this.lastPos = top;
  
    this.galers.forEach((galer, i) => {
      this.zVals[i] += delta * -6.1;
      let transform = `translateZ(${this.zVals[i]}px)`;
      let opacity = this.zVals[i] < Math.abs(this.zSpacing) / 1.8 ? 1 : 0;
      this.renderer.setAttribute(galer, 'style', `transform: ${transform}; opacity: ${opacity}`);
    });
  
    const windowHeight = window.innerHeight;
    const scrollY = window.scrollY;
    const bodyHeight = document.body.clientHeight;

    // Check if we've reached the bottom of the page with some threshold
    if (scrollY >= bodyHeight - windowHeight - 100) {
      // Apply the fade-out effect
      this.renderer.addClass(this.rootElement.nativeElement, 'fade-out');
    
      // Delay navigation to allow for the fade-out effect
      setTimeout(() => {
        this.router.navigate(['login']);
      }, 2000); // Match this duration to your CSS transition duration
    }
  }


  @HostListener('window:focus')
  handleWindowFocus(): void {
    const soundButton = this.el.nativeElement.querySelector('.soundbutton');
    if (!soundButton.classList.contains('paused') && this.toggleSound) {
      this.audioPlayer.nativeElement.play();
    }
  }

  @HostListener('window:blur')
  handleWindowBlur(): void {
    this.audioPlayer.nativeElement.pause();
  }
}
