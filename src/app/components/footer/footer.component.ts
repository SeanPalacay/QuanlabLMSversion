import { Component, OnInit } from '@angular/core';
import { trigger, state, style, transition, animate } from '@angular/animations';

@Component({
  selector: 'app-footer',
  templateUrl: './footer.component.html',
  styleUrls: ['./footer.component.css'],
  animations: [
    trigger('openClose', [
      state('void', style({
        opacity: 0,
        marginLeft: '0px', 
      })),
      transition('void => *', [
        style({ opacity: 1, marginBottom: '-100px' }), 
        animate('300ms ease-in-out', style({ opacity: 1, marginBottom: '0px' }))
      ]),
      transition('* => void', [
        animate('50ms ease-in-out', style({ opacity: 0, marginBottom: '-100px' })) 
      ]),
    ]),
  ],
})
export class FooterComponent implements OnInit {
  menuState: string = 'in';
  isArrowUp: boolean = false; // Track the state of the arrow icon
  isPressed: boolean = true; // Track the state of the button press
  ngOnInit(): void {
    // Initially show the menu
    this.toggleMenu();
  }

  toggleMenu(): void {
    // Toggles between 'in' and 'out' states
    this.menuState = this.menuState === 'out' ? 'in' : 'out';
        // Toggle the arrow icon state
        this.isArrowUp = !this.isArrowUp;
        // Toggle the button press state
        this.isPressed = !this.isPressed;
  }

  get isMenuOut(): boolean {
    // Returns true if the menu is in the 'out' state
    return this.menuState === 'out';
  }
}
