import { Component, Renderer2 } from '@angular/core';
import { MatCardModule } from '@angular/material/card';
import { CommonModule } from '@angular/common';

@Component({
  selector: 'app-work',
  standalone: true,
  imports: [MatCardModule, CommonModule],
  template: `
    <div style="display:flex;height:60vh;min-width:320px;user-select:none;">
      <mat-card style="flex:0 0 {{leftWidth}}px; min-width:80px; transition:width 0.1s;">
        左區塊
      </mat-card>
      <div
        (mousedown)="startDrag($event)"
        [ngStyle]="{
          width: '8px',
          cursor: 'col-resize',
          background: dragging ? '#90caf9' : (hover ? '#b3e5fc' : '#e0e0e0'),
          transition: 'background 0.2s',
          zIndex: 1
        }"
        (mouseenter)="hover=true"
        (mouseleave)="hover=false"
      ></div>
      <mat-card style="flex:1 1 0; min-width:80px; margin-left:8px;">
        右區塊
      </mat-card>
    </div>
  `
})
export class WorkComponent {
  leftWidth = 200;
  dragging = false;
  hover = false;
  private startX = 0;
  private startWidth = 0;

  constructor(private renderer: Renderer2) {}

  startDrag(event: MouseEvent): void {
    this.dragging = true;
    this.startX = event.clientX;
    this.startWidth = this.leftWidth;
    const mouseMove = (e: MouseEvent) => {
      const newWidth = this.startWidth + (e.clientX - this.startX);
      this.leftWidth = Math.max(80, newWidth);
    };
    const mouseUp = () => {
      this.dragging = false;
      this.renderer.removeClass(document.body, 'no-select');
      window.removeEventListener('mousemove', mouseMove);
      window.removeEventListener('mouseup', mouseUp);
    };
    this.renderer.addClass(document.body, 'no-select');
    window.addEventListener('mousemove', mouseMove);
    window.addEventListener('mouseup', mouseUp);
  }
}
