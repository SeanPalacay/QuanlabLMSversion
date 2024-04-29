import { Component } from '@angular/core';

@Component({
  selector: 'app-active-bar',
  templateUrl: './active-bar.component.html',
  styleUrls: ['./active-bar.component.css']
})
export class ActiveBarComponent {
  participants: string[] = ['com 1', 'com 2', 'com 3', 'com 4', 'com 5'];
  micStates: { [participant: string]: boolean } = {};

  toggleMicState(participant: string): void {
    this.micStates[participant] = !this.micStates[participant];
  }

  getMicIcon(participant: string): string {
    return this.micStates[participant] ? 'assets/mute.png' : 'assets/mic.png';
  }
}
