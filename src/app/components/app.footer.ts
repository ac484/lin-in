import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';

@Component({
  selector: 'app-footer',
  standalone: true,
  imports: [CommonModule],
  template: `
     <div>
        <!-- 已移除底部連結，僅保留樣式容器 -->
    </div>
  `,
})
export class AppFooter {

}
