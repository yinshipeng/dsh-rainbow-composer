# dsh-rainbow-composer · 彩虹输入框

给 DeepSeek Harness（DSH）的消息输入框加一圈**缓慢流动的彩虹渐变描边**。

> A DeepSeek Harness (DSH) Web UI plugin: a flowing rainbow gradient border around the message composer. Pure CSS, no image assets, lightweight.

```
╭──────────────────────────────────────────╮   ← 1.5px 彩虹环，9s 转一圈
│  描述你想要的任何内容，/ 调用指令…        │
╰──────────────────────────────────────────╯
```

## 效果

- 1.5px 的 `conic-gradient` 彩虹环，贴着输入框卡片边缘
- 色相沿环缓慢旋转（9s 一圈），不闪、不抢注意力
- 纯 CSS 实现：没有图片、没有 canvas、没有 JS 动画循环
- 只用 `::before` 伪元素，不占用 DSH 卡片自己的 `::after`（那是选工作区时的虚线提示）
- 系统开启「减弱动态效果」时自动停止旋转，只保留静止的彩虹环

原型的「呼吸光晕」已刻意移除：在 DSH 里它的节奏不如独立网页自然，因此插件默认只保留干净的描边。想要一层**不呼吸的静态柔光**，取消 `client.js` 里 `::after` 注释块即可。

## 安装

### 插件市场（推荐）

在 DSH 的 **插件 → 发现** 中添加索引源后搜索 `dsh-rainbow-composer`（收录后可见）：

```text
https://dshopen.org/index.json
```

### 命令行

```bash
# 从固定提交安装
dsh plugin --profile desktop add 'git+https://github.com/yinshipeng/dsh-rainbow-composer.git'

# 发布 npm 版本后
dsh plugin --profile desktop add dsh-rainbow-composer
```

安装后刷新页面（桌面端重启客户端）即可看到描边。

## 实现

`client.js` 在插件激活时向 `<head>` 注入一段样式，停用时原样移除：

| 步骤 | 做法 |
| --- | --- |
| 角度动画 | `@property --dsh-rb-angle` 声明角度类型，`@keyframes` 让它 0° → 360° |
| 彩虹环 | `::before` 铺 `conic-gradient(from var(--dsh-rb-angle))`，再用 `mask` + `mask-composite: exclude` 挖掉中间，只留 1.5px 边缘 |
| 作用范围 | 只选 `[data-composer-card]`，不重绘其他区域 |
| 生命周期 | 样式节点挂在 `ctx.effect` 的清理函数里，关闭插件即移除 |

Host 半（`index.js`）是空实现：没有接口、没有网络、没有数据访问。

## 自定义

改 `client.js` 里的常量后保存，client-HMR 会热重载（几秒；没反应就 ⌘R）：

- **配色**：`HUES` 数组，顺时针 8 段色标
- **转速**：`dsh-rb-spin 9s`，改成 `18s` 更慢，删掉 `animation` 就静止
- **粗细**：`--dsh-rb-w: 1.5px`
- **静态柔光**：取消注释 `::after` 块，调 `opacity` / `blur()` / `inset`

## 隐私与安全

- 不注册任何 Host 路由，不读写文件，不访问网络
- 不读取消息、会话或模型数据，只注入一段 CSS
- 关闭插件后样式立即移除

## 兼容性

| 项 | 要求 |
| --- | --- |
| DSH | `>=0.2.2-rc.1`（声明在 `dsh.engines.dsh`） |
| Node.js | `>=22.19.0` |
| 形态 | Web / Desktop（Chromium 内核，支持 `@property` 与 `mask-composite`） |

已在 macOS + DeepSeek Harness Desktop 0.2.2-rc.1 实测。若 DSH 未来改动输入框的 `data-composer-card` 属性，插件会静默不生效，届时改选择器即可。

## 结构

| 文件 | 职责 |
| --- | --- |
| `index.js` | Host 半：空实现 |
| `client.js` | Browser 半：注入样式 + 注册加载标记 |
| `cordis.patch.yml` | 插入 `rainbow-composer` 行 |
| `locale/*.json` | 插件管理页的标题与说明 |
| `icon.svg` | 插件图标 |

## 卸载

```bash
dsh plugin --profile desktop remove dsh-rainbow-composer
```

或在 设置 → 插件 里关闭「彩虹输入框」。

## English

**dsh-rainbow-composer** paints a slowly flowing rainbow gradient border around the DSH message composer.

- 1.5px conic-gradient ring on `[data-composer-card]::before`, rotating once every 9 seconds through an `@property` angle
- Pure CSS: no images, no canvas, no JavaScript animation loop; the stylesheet is injected on activation and removed on dispose
- The breathing halo from the standalone prototype is intentionally omitted — the composer keeps the crisp ring. Uncomment the `::after` block in `client.js` for a static, non-breathing halo
- Respects `prefers-reduced-motion`
- The Host half is a no-op: no routes, no files, no network, no message data

Install:

```bash
dsh plugin --profile desktop add 'git+https://github.com/yinshipeng/dsh-rainbow-composer.git'
```

Tested on macOS with DSH 0.2.2-rc.1 (Web and Desktop).

## License

MIT © 2026 yinshipeng