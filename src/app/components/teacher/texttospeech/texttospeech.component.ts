// texttospeech.component.ts

import { Component,ElementRef, NgZone, OnInit, ViewChild } from '@angular/core';
import { EMPTY, catchError } from 'rxjs'
import { APIService } from 'src/app/services/API/api.service';
import { environment } from 'src/environments/environment';

@Component({
  selector: 'app-texttospeech',
  templateUrl: './texttospeech.component.html',
  styleUrls: ['./texttospeech.component.css']
})

export class TexttospeechComponent implements OnInit {
  recording: boolean = false;
  playing: boolean = false;
  audio?: HTMLAudioElement;
  textInput: string = '';
  language: string = 'en'; // Holds the language code
  analyser?: AnalyserNode;
  bufferLength?: number;
  mediaRecorder?: MediaRecorder;
  lastRecordingLength?: number;
  showDropdown: boolean = false; // Controls the visibility of the language dropdown
  showTooltip: boolean = false;
  selectedLanguageName: string = 'English'; // Default value, adjust as needed


  constructor(
    private API:APIService,
  ) {
  }
  
   
  ngOnInit(): void {
   
  }

  loadVisuallizer(audio:HTMLMediaElement){
    const context = new AudioContext();
    const src = context.createMediaElementSource(audio);
    this.analyser = context.createAnalyser();
  
    src.connect(this.analyser);
    this.analyser.connect(context.destination);
  
    this.analyser.fftSize = 256;
  
    this.bufferLength = this.analyser.frequencyBinCount;
    this.renderFrame();
  }


// Method to toggle the dropdown visibility
toggleDropdown() {
  this.showDropdown = !this.showDropdown;
}


// Method to handle language selection
selectLanguage(lang: string, langName: string) {
  this.language = lang;
  this.selectedLanguageName = langName;
  this.showDropdown = false; // Optionally close the dropdown upon selection
}



  spoken(){
    // this.startSpeechtoText();
    // Simulate stopping the recording after a duration (adjust as needed)
    setTimeout(() => {
      this.recording = false;
      // this.endSpeechToText();
    }, 2000);
    this.API.successSnackbar('Hello');
  }

  startRecording() {
    if (this.recording) {
      this.mediaRecorder!.stop();
      this.mediaRecorder?.stream.getTracks().forEach(track => track.stop());
      this.recording = false;
      this.API.showSnackbar('Recording finished', 'OK', 3000); // Snackbar for stopping the recording
    } else {
      navigator.mediaDevices.getUserMedia({ audio: true })
        .then(stream => {
          this.mediaRecorder = new MediaRecorder(stream);
          this.mediaRecorder.ondataavailable = (event) => {
            if (event.data.size > 0) {
              this.audio = new Audio();
              this.audio.src = URL.createObjectURL(event.data);
              this.audio.load();
              this.loadVisuallizer(this.audio);
            }
          };
          this.mediaRecorder.start();
          this.recording = true;
          this.API.showSnackbar('Recording in progress', 'OK', 3000); // Snackbar for starting the recording
        })
        .catch(err => console.error('Error accessing media devices.', err));
    }
  }
  

  playAudio() {
    if (this.audio == null) {
      this.API.showSnackbar('Record some audio to play.', 'OK', 3000);
      return;
    }
    if (this.playing) {
      this.playing = false;
      this.audio.pause();
    } else {
      this.playing = true;
      this.audio.play();
      this.API.showSnackbar('Listening to recording', 'OK', 3000); // Snackbar for playback
      this.audio.onended = () => {
        this.playing = false;
      };
    }
  }
  


  generatingspeech:boolean = false;

  textToSpeech(){
    if(this.generatingspeech){
      return;
    }
    if(this.textInput.trim() == ''){
      this.API.failedSnackbar('Please enter something to speak.')
      return;
    }
    this.generatingspeech = true;
    this.API.justSnackbar('Generating speech from text...', 999999999);
    this.API.textToSpeech(this.textInput, this.language).subscribe(
      data=>{
        this.API.successSnackbar('Speech generated!');
        this.audio = new Audio();
        this.audio!.src = data.fileDownloadUrl ;
        this.audio!.load();
        // this.loadVisuallizer(this.audio);
        this.audio!.play();
        this.generatingspeech=false;
      }
    )
  }
  renderFrame = () => {
    requestAnimationFrame(this.renderFrame);
    const canvas = document.getElementById("canvas") as HTMLCanvasElement;
    const dataArray = new Uint8Array(this.bufferLength!);

    const canvasWidth = window.innerWidth;
    const canvasHeight = 130;
  
    canvas.width = canvasWidth;
    canvas.height = canvasHeight;
  
    const barWidth = (canvasWidth / this.bufferLength!) * 2;
    const barHeightMultiplier = 0.5;
    let barHeight: number;
    let x = 0;
  
    const ctx = canvas.getContext("2d")!;
  
    this.analyser!.getByteFrequencyData(dataArray);
  
    // Make the background color transparent
    ctx.clearRect(0, 0, canvas.width, canvas.height);
  
    // Create gradient for the bars
    const gradient = ctx.createLinearGradient(0, 0, 0, canvasHeight);
    gradient.addColorStop(0, "rgba(6, 120, 175, 0.7)"); // Adjust the alpha value for transparency
    gradient.addColorStop(1, "rgba(96, 229, 187, 0.7)"); // Adjust the alpha value for transparency
  
    for (let i = 0; i < this.bufferLength!; i++) {
      barHeight = dataArray[i] * barHeightMultiplier;
  
      // Use the gradient for the bar color
      ctx.fillStyle = gradient;
      ctx.fillRect(x, canvasHeight - barHeight, barWidth, barHeight);
  
      x += barWidth + 1;
    }
  };
  

  download() {
    if (!this.audio) {
      this.API.failedSnackbar('No audio recorded.');
    } else {
      const link = document.createElement('a');
      link.href = this.audio.src;
      link.download = 'recorded_audio.mp3';
      link.click();
    }
  }
}



// window.onload = function () {
//   const file = document.getElementById("thefile") as HTMLInputElement;
//   const audio = document.getElementById("audio") as HTMLAudioElement;
//   const canvas = document.getElementById("canvas") as HTMLCanvasElement;

//   const context = new AudioContext();
//   const src = context.createMediaElementSource(audio);
//   const analyser = context.createAnalyser();

//   src.connect(analyser);
//   analyser.connect(context.destination);

//   analyser.fftSize = 256;

//   const bufferLength = analyser.frequencyBinCount;
//   console.log(bufferLength);

//   const dataArray = new Uint8Array(bufferLength);

//   // Add padding on both sides
//   const paddingLeft = 10;
//   const paddingRight = 10;

//   const canvasWidth = 377 + paddingLeft + paddingRight; // Adjust the desired width and padding
//   const canvasHeight = 130; // Adjust the desired height and padding

//   const barWidth = ((canvasWidth - paddingLeft - paddingRight) / bufferLength) * 2;
//   const barHeightMultiplier = 0.5;
//   let barHeight: number;
//   let x = 0;

//   const ctx = canvas.getContext("2d")!;

//   function renderFrame() {
//     requestAnimationFrame(renderFrame);

//     x = paddingLeft;

//     analyser.getByteFrequencyData(dataArray);

//     // Change background color to white
//     ctx.fillStyle = "#fff";
//     ctx.fillRect(0, 0, canvasWidth, canvasHeight);

//     // Create gradient for the bars
//     const gradient = ctx.createLinearGradient(0, 0, 0, canvasHeight);
//     gradient.addColorStop(0, "#0678AF");
//     gradient.addColorStop(1, "#60E5BB");

//     for (let i = 0; i < bufferLength; i++) {
//       barHeight = dataArray[i] * barHeightMultiplier;

//       // Use the gradient for the bar color
//       ctx.fillStyle = gradient;
//       ctx.fillRect(x, canvasHeight - barHeight, barWidth, barHeight);

//       x += barWidth + 1;
//     }
//   }

//   file.onchange = function () {
//     const files = (this as HTMLInputElement).files;
//     audio.src = URL.createObjectURL(files![0]);
//     audio.load();
//     audio.play();

//     // Set the container dimensions
//     canvas.width = canvasWidth;
//     canvas.height = canvasHeight;

//     audio.play();
//     renderFrame();
//   };
// };
