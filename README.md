# Hover Dictionary

浏览器划词释义扩展，选中文字后通过快捷键呼出悬浮窗，调用小米 MiMo AI 模型返回简洁释义，也支持免费字典和维基百科作为备用数据源。

## 功能特点

- 快捷键触发：选中文字后按 `Ctrl+Shift+D` 呼出悬浮窗，`Esc` 关闭
- AI 释义：调用小米 MiMo API（mimo-v2.5-pro 模型）返回一段话简洁解释
- 免费备用：AI 不可用时自动回退到 Free Dictionary API 和维基百科
- 轻量高效：纯原生 JS，无外部依赖

## 安装步骤

1. 打开浏览器扩展管理页面
   - Chrome：`chrome://extensions/`
   - Edge：`edge://extensions/`
2. 开启右上角的**开发者模式**
3. 点击「加载已解压的扩展程序」，选择 `Definition of floating window` 文件夹

## 使用方法

1. 点击浏览器工具栏的扩展图标，在弹出面板中填入小米 MiMo API Key 并保存
2. 在任意网页上**选中文字**
3. 按 `Ctrl+Shift+D` 呼出悬浮窗
4. 点击「获取释义」按钮
5. 按 `Esc` 或点击悬浮窗外部关闭

API Key 获取地址：https://platform.xiaomimimo.com/console/api-keys

## 技术栈

- Chrome Extensions Manifest V3
- Content Script + Background Service Worker（消息传递架构，避免 CORS 限制）
- 小米 MiMo API（OpenAI 兼容格式，endpoint：`https://api.xiaomimimo.com/v1/chat/completions`）
- Free Dictionary API（免费字典备用）
- Wikipedia REST API（维基百科备用）

## 文件结构

```
free-extension/
  manifest.json    - 扩展配置（权限、快捷键、service worker 注册）
  popup.html       - 扩展弹出面板 UI
  popup.js         - 弹出面板逻辑（API Key 读写）
  content.js       - 内容脚本（悬浮窗创建、消息发送、字典/维基百科回退）
  background.js    - Service Worker（接收消息、调用 MiMo API、返回结果）
  icons/           - 扩展图标
```

## 请求流程

```
用户选中文字 → Ctrl+Shift+D → content.js 创建悬浮窗
  → 点击「获取释义」
  → content.js 发送消息到 background.js
  → background.js 调用 MiMo API
  → 返回结果到 content.js 渲染
  → 失败时回退到 Free Dictionary / 维基百科
```
