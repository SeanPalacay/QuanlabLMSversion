import { Component } from '@angular/core';

@Component({
  selector: 'app-drag1',
  templateUrl: './drag1.component.html',
  styleUrls: ['./drag1.component.css']
})
export class Drag1Component {
  
  score = 0;
  verbs = ['loved', 'knew', 'come', 'stopped'];
  story = [
    {
      sentence:"She began to cry again. Mrs. Wilson was very sad because she",
      answer: "knew" ,
      blank: "_____",
      id: '1'
    },
    {
    sentence:"her sister",
    answer: "loved" ,
    blank: "_____",
    id: '2'
  },
  {
    sentence:"the cat very much. Suddenly Mrs. Wilson said, I can bury your cat in my garden in Duncan, and you can",
    answer: "come",
      blank: "_____",
      id: '3'
  },
  {
    sentence:"and visit him sometimes. Mrs. Smith",
    answer: "stopped",
    blank: "_____",
    id: '4'  
    
  },
  {
    sentence:"crying, and the two sisters had tea together and a nice visit.", 
    answer: null,
    blank: null,
    id: '1'
  },
]

onDrop(event: any, verb: string) {
  event.preventDefault();
  const target = event.target as HTMLElement;
  const draggedVerb = event.dataTransfer.getData('text/plain');
  console.log(target.id,verb);
  if (this.verbs.includes(draggedVerb)) {
    target.textContent = draggedVerb;
    
    if (target.textContent === draggedVerb) {
      this.removeVerb(draggedVerb);

      if (target.id === draggedVerb) {
        
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
}
