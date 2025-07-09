# Frontend Layout

本目錄為前台專用框架（LayoutFrontendComponent），所有公開頁面（如 landing、finance 等）皆可掛載於此。

## 用途
- 提供前台網站統一的 header、footer、主內容區。
- 與後台（basic）、空白（blank）、認證（passport）框架分離，維護更清晰。

## 用法
- 在路由設定中，將前台頁面掛載於此 layout 下：

```typescript
{
  path: '',
  component: LayoutFrontendComponent,
  children: [
    { path: 'landing', loadChildren: () => import('../routes/landing/routes').then(m => m.routes) },
    { path: 'finance', loadChildren: () => import('../routes/finance/routes').then(m => m.routes) }
  ]
}
```

- 之後所有前台頁面都會自動套用 header/footer 樣式。
