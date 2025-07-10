import { Component } from '@angular/core';

@Component({
  selector: 'app-request',
  templateUrl: './request.component.html',
  styleUrls: ['./request.component.scss'],
})
export class RequestComponent {
  // 這裡可以放資料模型與事件處理邏輯
  requestInProgress = false;

  submitRequest() {
    this.requestInProgress = true;
    // 模擬 API 呼叫
    setTimeout(() => {
      this.requestInProgress = false;
      alert('Request submitted!');
    }, 1000);
  }
}
