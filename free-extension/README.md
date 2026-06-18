# 悬浮词典

一个免费的浏览器扩展，在选中文字附近显示词义解释，使用 DeepSeek 提供服务。

## 功能特点

- 完全免费：不需要 API Key
- 操作简单：选中文字 → 悬浮窗弹出 → 点击查询
- 轻量高效：占用资源少
- 可拖动：悬浮窗可以拖到任意位置

## 安装步骤

1. 打开浏览器扩展管理页面
   - Chrome：chrome://extensions/
   - Edge：edge://extensions/

2. 开启右上角的开发者模式

3. 点击「加载已解压的扩展程序」，选择 free-extension 文件夹

## 使用方法

1. 在任意网页上选中词语
2. 悬浮窗会自动出现在选中文字附近
3. 点击「Get Definition」按钮
4. DeepSeek 会在新标签页打开并显示解释

## 文件结构

free-extension/
  manifest.json    - 扩展配置文件
  content.js       - 悬浮窗核心逻辑
  content.css      - 悬浮窗样式
  popup.html       - 扩展信息页面
  background.js    - 右键菜单脚本
  icons/           - 扩展图标

## 注意事项

- 需要登录 DeepSeek 账号才能使用（免费注册）
- 点击页面其他地方会自动关闭悬浮窗
- 可以拖动悬浮窗到任意位置

