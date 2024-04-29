import { Component } from '@angular/core';
import { Location } from '@angular/common';
@Component({
  selector: 'app-module1',
  templateUrl: './module1.component.html',
  styleUrls: ['./module1.component.css']
})
export class Module1Component {

  constructor(private location: Location) { }

  redirectToOtherPage() {
    this.location.back();
  }
  verbs = ['loved', 'knew', 'come', 'stopped'];
  score = 0;

  onDrop(event: any, verb: string) {
    event.preventDefault();
    const target = event.target as HTMLElement;
    const draggedVerb = event.dataTransfer.getData('text/plain');
  
    if (this.verbs.includes(draggedVerb)) {
      
      target.textContent = draggedVerb;
      if(target.textContent = draggedVerb){
        this.removeVerb(draggedVerb);
         if(verb === draggedVerb){
        this.score += 1;
        this.removeVerb(verb);
      }
      }
     

    }
  }
  removeVerb(verb: string) {
    const index = this.verbs.indexOf(verb);
    if (index !== -1) {
      this.verbs.splice(index, 1);
    }
  }

  onDragStart(event: any, verb: string) {
    event.dataTransfer.setData('text/plain', verb);
  }

  allowDrop(event: any) {
    event.preventDefault();
  }


  // 2


  verbs1 = ['remembered', 'put', 'arrived', 'took', 'walked','waited', 'got'];
  score1 = 0;

  onDrop1(event1: any, verb1: string) {
    event1.preventDefault();
    const target = event1.target as HTMLElement;
    const draggedVerb = event1.dataTransfer.getData('text/plain');
  
    if (this.verbs.includes(draggedVerb)) {
      
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


  onDragStart1(event: any, verb1: string) {
    event.dataTransfer.setData('text/plain', verb1);
  }

  allowDrop1(event: any) {
    event.preventDefault();
  }

}
