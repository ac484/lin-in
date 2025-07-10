import { Component, Input, Output, EventEmitter, Renderer2 } from '@angular/core';
import { CommonModule } from '@angular/common';

@Component({
  selector: 'app-splitter',
  standalone: true,
  imports: [CommonModule],
  template: `
    <div class="splitter-left" [style.flex]="'0 0 ' + leftWidth + 'px'" [style.minWidth.px]="min">
      <ng-content select="[left]"></ng-content>
    </div>
    <div
      class="splitter-bar"
      [class.active]="dragging"
      [class.hover]="hover && !dragging"
      (mousedown)="startDrag($event)"
      (mouseenter)="hover=true"
      (mouseleave)="hover=false"
    >
      <svg width="16" height="32" viewBox="0 0 16 32" style="display:block;margin:auto;" aria-hidden="true">
        <polyline points="6,10 2,16 6,22" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round"/>
        <polyline points="10,10 14,16 10,22" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round"/>
      </svg>
    </div>
    <div class="splitter-right">
      <ng-content select="[right]"></ng-content>
    </div>
  `,
  styleUrls: ['./splitter.component.scss']
})
export class SplitterComponent {
  @Input() left = 200;
  @Input() min = 80;
  @Output() leftWidthChange = new EventEmitter<number>();
  leftWidth = 200;
  dragging = false;
  hover = false;
  private startX = 0;
  private startWidth = 0;

  constructor(private renderer: Renderer2) {}

  ngOnInit() {
    this.leftWidth = this.left;
  }

  startDrag(event: MouseEvent): void {
    this.dragging = true;
    this.startX = event.clientX;
    this.startWidth = this.leftWidth;
    const mouseMove = (e: MouseEvent) => {
      const newWidth = Math.max(this.min, this.startWidth + (e.clientX - this.startX));
      this.leftWidth = newWidth;
      this.leftWidthChange.emit(newWidth);
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