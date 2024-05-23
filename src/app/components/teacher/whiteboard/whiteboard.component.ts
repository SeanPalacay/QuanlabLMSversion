import { Component, ElementRef, ViewChild, AfterViewInit, OnDestroy } from '@angular/core';

interface TextElement {
  text: string;
  x: number;
  y: number;
  dragging: boolean;
  editing: boolean;
}

@Component({
  selector: 'app-whiteboard',
  templateUrl: './whiteboard.component.html',
  styleUrls: ['./whiteboard.component.css']
})
export class WhiteboardComponent implements AfterViewInit, OnDestroy {
  @ViewChild('whiteboard', { static: true }) whiteboardCanvas!: ElementRef<HTMLCanvasElement>;

  private ctx!: CanvasRenderingContext2D;
  private painting: boolean = false;
  private penColor: string = '#000000';
  textElements: TextElement[] = [];

  ngAfterViewInit(): void {
    const canvas = this.whiteboardCanvas.nativeElement;
    this.ctx = canvas.getContext('2d')!;

    canvas.addEventListener('mousedown', this.startPosition.bind(this));
    canvas.addEventListener('mouseup', this.endPosition.bind(this));
    canvas.addEventListener('mousemove', this.draw.bind(this));
    this.resizeCanvas();
  }

  ngOnDestroy(): void {
    window.removeEventListener('resize', this.resizeCanvas.bind(this));
  }

  private resizeCanvas(): void {
    const canvas = this.whiteboardCanvas.nativeElement;
    canvas.width = canvas.clientWidth;
    canvas.height = canvas.clientHeight;
  }

  private startPosition(e: MouseEvent): void {
    this.painting = true;
    this.draw(e);
  }

  private endPosition(): void {
    this.painting = false;
    this.ctx.beginPath();
  }

  private draw(e: MouseEvent): void {
    if (!this.painting) return;
    const rect = this.whiteboardCanvas.nativeElement.getBoundingClientRect();
    const scaleX = this.whiteboardCanvas.nativeElement.width / rect.width;
    const scaleY = this.whiteboardCanvas.nativeElement.height / rect.height;

    this.ctx.lineWidth = 5;
    this.ctx.lineCap = 'round';
    this.ctx.strokeStyle = this.penColor;

    this.ctx.lineTo((e.clientX - rect.left) * scaleX, (e.clientY - rect.top) * scaleY);
    this.ctx.stroke();
    this.ctx.beginPath();
    this.ctx.moveTo((e.clientX - rect.left) * scaleX, (e.clientY - rect.top) * scaleY);
  }

  addTextElement(): void {
    const newTextElement: TextElement = {
      text: 'Double-click to edit',
      x: 50,
      y: 50,
      dragging: false,
      editing: false
    };
    this.textElements.push(newTextElement);
  }

  startDraggingText(textElement: TextElement, event: MouseEvent): void {
    if (!textElement.editing) {
      textElement.dragging = true;
      event.preventDefault();
    }
  }

  dragText(textElement: TextElement, event: MouseEvent): void {
    if (textElement.dragging) {
      textElement.x = event.clientX;
      textElement.y = event.clientY;
    }
  }

  stopDraggingText(textElement: TextElement): void {
    textElement.dragging = false;
  }

  editText(textElement: TextElement): void {
    textElement.editing = true;
  }

  stopEditingText(textElement: TextElement): void {
    textElement.editing = false;
  }
}