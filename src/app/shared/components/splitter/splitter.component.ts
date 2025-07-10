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
    <div class="splitter-bar" (mousedown)="startDrag($event)">
      <span class="splitter-icon">&lt;&gt;</span>
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
  private startX = 0;
  private startWidth = 0;

  constructor(private renderer: Renderer2) {}

  ngOnInit() {
    this.leftWidth = this.left;
  }

  startDrag(event: MouseEvent): void {
    this.startX = event.clientX;
    this.startWidth = this.leftWidth;
    const mouseMove = (e: MouseEvent) => {
      const newWidth = Math.max(this.min, this.startWidth + (e.clientX - this.startX));
      this.leftWidth = newWidth;
      this.leftWidthChange.emit(newWidth);
    };
    const mouseUp = () => {
      this.renderer.removeClass(document.body, 'no-select');
      window.removeEventListener('mousemove', mouseMove);
      window.removeEventListener('mouseup', mouseUp);
    };
    this.renderer.addClass(document.body, 'no-select');
    window.addEventListener('mousemove', mouseMove);
    window.addEventListener('mouseup', mouseUp);
  }
} 