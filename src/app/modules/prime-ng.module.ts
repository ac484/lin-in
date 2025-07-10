// PrimeNG 核心模組
import { CommonModule } from '@angular/common';
// PrimeNG 按鈕模組
import { ButtonModule } from 'primeng/button';
// PrimeNG 輸入框模組
import { InputTextModule } from 'primeng/inputtext';
// PrimeNG 卡片模組
import { CardModule } from 'primeng/card';
// PrimeNG 工具列模組
import { ToolbarModule } from 'primeng/toolbar';
// PrimeNG 選單模組
import { MenuModule } from 'primeng/menu';
// PrimeNG 漣漪效果模組
import { RippleModule } from 'primeng/ripple';
// PrimeNG 提示訊息模組
import { ToastModule } from 'primeng/toast';
// PrimeNG 對話框模組
import { DialogModule } from 'primeng/dialog';
// PrimeNG 表格模組
import { TableModule } from 'primeng/table';
// PrimeNG 下拉選單模組
import { DropdownModule } from 'primeng/dropdown';
// PrimeNG 核取方塊模組
import { CheckboxModule } from 'primeng/checkbox';
// PrimeNG 單選按鈕模組
import { RadioButtonModule } from 'primeng/radiobutton';
// PrimeNG 數字輸入模組
import { InputNumberModule } from 'primeng/inputnumber';
// PrimeNG 行事曆模組
import { CalendarModule } from 'primeng/calendar';
// PrimeNG 側邊欄模組
import { SidebarModule } from 'primeng/sidebar';
// PrimeNG 面板模組
import { PanelModule } from 'primeng/panel';
// PrimeNG 手風琴模組
import { AccordionModule } from 'primeng/accordion';
// PrimeNG 輪播進度模組
import { ProgressSpinnerModule } from 'primeng/progressspinner';
// PrimeNG 確認對話框模組
import { ConfirmDialogModule } from 'primeng/confirmdialog';
// PrimeNG 工具提示模組
import { TooltipModule } from 'primeng/tooltip';
// PrimeNG 檔案上傳模組
import { FileUploadModule } from 'primeng/fileupload';
// PrimeNG 動態對話框服務
import { DialogService, DynamicDialog } from 'primeng/dynamicdialog';
// PrimeNG 分割按鈕模組
import { SplitButtonModule } from 'primeng/splitbutton';
// PrimeNG 資料檢視模組
import { DataViewModule } from 'primeng/dataview';
// PrimeNG 樹狀結構模組
import { TreeModule } from 'primeng/tree';
// PrimeNG 選單列模組
import { MenubarModule } from 'primeng/menubar';
// PrimeNG 時間軸模組
import { TimelineModule } from 'primeng/timeline';
// PrimeNG 組織結構圖模組
import { OrganizationChartModule } from 'primeng/organizationchart';
// PrimeNG 分割面板模組
import { SplitterModule } from 'primeng/splitter';
// PrimeNG 樹狀表格模組
import { TreeTableModule } from 'primeng/treetable';
// PrimeNG 進度條模組
import { ProgressBarModule } from 'primeng/progressbar';
// PrimeNG 標籤模組
import { TagModule } from 'primeng/tag';
// PrimeNG 徽章模組
import { BadgeModule } from 'primeng/badge';
// PrimeNG Tree 右鍵選單模組
import { ContextMenuModule } from 'primeng/contextmenu';
// PrimeNG 拖曳模組
import { DragDropModule } from 'primeng/dragdrop';
// PrimeNG 多值標籤模組
// import { ChipsModule } from 'primeng/chips'; // 若未安裝可先註解
import { ScrollerModule } from 'primeng/scroller';


export const PrimeNgModules = [
  CommonModule, // 核心模組
  ButtonModule, // 按鈕
  InputTextModule, // 輸入框
  CardModule, // 卡片
  ToolbarModule, // 工具列
  MenuModule, // 選單
  RippleModule, // 漣漪效果
  ToastModule, // 提示訊息
  DialogModule, // 對話框
  TableModule, // 表格
  DropdownModule, // 下拉選單
  CheckboxModule, // 核取方塊
  RadioButtonModule, // 單選按鈕
  InputNumberModule, // 數字輸入
  CalendarModule, // 行事曆
  SidebarModule, // 側邊欄
  PanelModule, // 面板
  AccordionModule, // 手風琴
  ProgressSpinnerModule, // 輪播進度
  ConfirmDialogModule, // 確認對話框
  TooltipModule, // 工具提示
  FileUploadModule, // 檔案上傳
  DynamicDialog, // 動態對話框
  SplitButtonModule, // 分割按鈕
  DataViewModule, // 資料檢視
  TreeModule, // 樹狀結構
  MenubarModule, // 選單列
  TimelineModule, // 時間軸
  OrganizationChartModule, // 組織結構圖
  SplitterModule, // 分割面板
  TreeTableModule, // 樹狀表格
  ProgressBarModule, // 進度條
  TagModule, // 標籤
  BadgeModule, // 徽章
  ContextMenuModule, // Tree 右鍵選單
  DragDropModule, // Tree 拖曳
  ScrollerModule, // 虛擬捲動
  // ChipsModule // 多值標籤（如未安裝請勿加入）
  // 其他 PrimeNG 模組請加在此處
];
// DialogService 不需加入陣列，僅用於依賴注入
