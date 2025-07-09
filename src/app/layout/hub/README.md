# Hub Layout

本目錄為協作平台專用框架（LayoutHubComponent），所有團隊協作、專案管理等頁面皆可掛載於此。

## 用途
- 提供協作平台統一的 header、footer、主內容區。
- 與前台（open/ui）、後台（basic）、空白（blank）、認證（passport）框架分離，維護更清晰。

## 用法
- 在路由設定中，將協作相關頁面掛載於此 layout 下：

```typescript
{
  path: '',
  component: LayoutHubComponent,
  children: [
    { path: 'project', loadChildren: () => import('../routes/project/routes').then(m => m.routes) },
    { path: 'team', loadChildren: () => import('../routes/team/routes').then(m => m.routes) }
    // 其他協作相關頁面
  ]
}
```

- 之後所有協作平台頁面都會自動套用 header/footer 樣式。
