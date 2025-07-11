// 本檔案依據 Firebase Console 專案設定，使用極簡晶片組件
import { Component, Input, Output, EventEmitter } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ChipModule } from 'primeng/chip';
import { FormsModule } from '@angular/forms';
import { InputTextModule } from 'primeng/inputtext';

@Component({
  selector: 'app-chips',
  standalone: true,
  imports: [CommonModule, ChipModule, FormsModule, InputTextModule],
  template: `
    <div class="flex flex-wrap gap-1 items-center">
      <p-chip
        *ngFor="let tag of tags; trackBy: trackByTag"
        [label]="tag"
        [removable]="true"
        (onRemove)="removeTag(tag)"
        styleClass="text-xs">
      </p-chip>
      <input
        *ngIf="editable"
        #tagInput
        type="text"
        pInputText
        [(ngModel)]="newTag"
        (keyup.enter)="addTag(); tagInput.value=''"
        (blur)="addTag()"
        placeholder="新增標籤"
        class="w-20 text-xs p-1 border-none outline-none"
        style="min-width: 60px; font-size: 0.75rem;">
    </div>
  `,
  styles: [`
    :host {
      display: block;
    }
    .flex { display: flex; }
    .flex-wrap { flex-wrap: wrap; }
    .gap-1 { gap: 0.25rem; }
    .items-center { align-items: center; }
    .w-20 { width: 5rem; }
    .text-xs { font-size: 0.75rem; }
    .p-1 { padding: 0.25rem; }
    .border-none { border: none; }
    .outline-none { outline: none; }
    :host ::ng-deep .p-chip {
      font-size: 0.75rem;
      padding: 0.25rem 0.5rem;
    }
  `]
})
export class ChipsComponent {
  @Input() tags: string[] = [];
  @Input() editable = true;
  @Output() tagsChange = new EventEmitter<string[]>();

  newTag = '';

  trackByTag(index: number, tag: string): string {
    return tag;
  }

  addTag(): void {
    const trimmed = this.newTag.trim();
    if (trimmed && !this.tags.includes(trimmed)) {
      const updatedTags = [...this.tags, trimmed];
      this.tagsChange.emit(updatedTags);
      this.newTag = '';
    }
  }

  removeTag(tag: string): void {
    const updatedTags = this.tags.filter(t => t !== tag);
    this.tagsChange.emit(updatedTags);
  }
} 