import { Component } from '@angular/core';

@Component({
  selector: 'app-drag2',
  templateUrl: './drag2.component.html',
  styleUrls: ['./drag2.component.css']
})
export class Drag2Component {
  verbs1 = ['remembered', 'put', 'said', 'arrived', 'took', 'walked','waited', 'got'];
  score1 = 0;

  onDrop1(event1: any, verb1: string) {
    event1.preventDefault();
    const target = event1.target as HTMLElement;
    const draggedVerb = event1.dataTransfer.getData('text/plain');
  
    if (this.verbs1.includes(draggedVerb)) {
      
      target.textContent = draggedVerb;
      if(target.textContent = draggedVerb){
        this.removeVerb(draggedVerb);
         if(verb1 === draggedVerb){
        this.score1 += 1;
        this.removeVerb(verb1);
      }
      }
     

    }
  }
  removeVerb(verb1: string) {
    const index = this.verbs1.indexOf(verb1);
    if (index !== -1) {
      this.verbs1.splice(index, 1);
    }
  }

  onDragStart1(event: any, verb1: string) {
    event.dataTransfer.setData('text/plain', verb1);
  }

  allowDrop1(event: any) {
    event.preventDefault();
  }

}
