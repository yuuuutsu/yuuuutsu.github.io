# 憂鬱的孤鳴 · 设计与开发准则

> 本文件是全站唯一的视觉规范。AI 在修改任何页面前必须先读本文件；改动样式后必须同步更新本文件。
> 适用范围：`C:\Users\admin\my-blog`。主题 `hugo-toigian/` 尽量不动，一切覆盖通过根目录 `layouts/`、`i18n/`、`static/css/custom.css` 实现。

---

## 1. 设计气质（一句话）

**日系可爱手账风**：淡蓝波点纸面 + 樱粉笔触 + 看板娘。圆润、软和、有点忧郁但不阴暗。所有新元素都要「长得像这个博客的一部分」，而不是像通用模板。

## 2. 配色（只用这些，新增颜色需先补充进本文件）

| 用途 | 值 | 说明 |
|---|---|---|
| 页面底色 | `#ebf4f7` | 淡蓝纸面，body/header/footer 统一 |
| 波点背景 | 白色 45% 透明，两层圆点 80px 平铺、错位 40px | `background-attachment: fixed`，钉在屏幕上；顶栏色块内用 25% 透明版 |
| 主粉色（文字） | `#d490a6` | 页脚、相册名等 |
| 虚线粉 | `#e8b9cc` | 所有虚线：2px dashed |
| 标签粉底 / 粉字 | `#fbe4ee` / `#b0577e` | 单数位标签 |
| 标签蓝底 / 蓝字 | `#cfe5f4` / `#4f7392` | 双数位标签 |
| 气泡描边 / 气泡文字 | `#d5dae2` / `#7a8494` | 想法气泡专用 |
| 深色模式 | 跟随主题 `bg-base` 变量，不单独定制 | 自定义色写在 `:root { --base: #ebf4f7 }` |

## 3. 字体与文字

- 字体栈：`"喵啃糖圆", "jf-openhuninn", sans-serif`（本地字体，位于 `/fonts/`，已注册 @font-face）。
- **全站禁止斜体**（front matter、CSS、模板都不得引入 `italic`；主题自带的要显式去掉）。
- 字号：
  - 正文 `.content`：18px（手机 16px）
  - 列表日期 `.content time`：16px
  - 顶栏博客名：18px
  - 文章标题 `article > h1`：电脑端主题默认，手机 1.5rem、line-height 1.3
  - Archive 年份：1.6rem bold；Archive/标签页文章标题 `.archive-title`：1.1rem / font-weight 900 / 0.6px 描边；日期 `.archive-date` 在标题**前面**（字号与标题一致 1.1rem、灰色 #7a8494、等宽数字、不含年份——年份由分组标题提供，格式 01/02）
  - 气泡文字：17px 竖排（手机 14px），`writing-mode: vertical-rl`，letter-spacing 0.12em

## 4. 间距与布局

| 变量 | 电脑端 | 手机端（≤640px） |
|---|---|---|
| `--content-width` | 52rem（832px，正文栏最大宽，居中） | 同左 |
| `--page-top` | 64px | 56px |
| `--page-gutter` | 16px | 12px |
| `--footer-height` | 主题变量，勿硬编码，需要时引用 | 同左 |

- 断点只有一个：**640px**。手机端必须：无横向滚动（`overflow-x: clip`）、单张大图铺满屏、宫格两列、左缩进取消。
- 悬浮物（小人、迷你按钮）对齐方式：与正文栏边缘对齐用 `max(calc((100vw - var(--content-width)) / 2), var(--page-gutter))`。

## 5. 组件规范

### 5.1 虚线分隔（全站统一）
`border-bottom: 2px dashed #e8b9cc;` —— 用于：文章头部 `.post-divider`（margin 10px 0 1.25rem）、Archive 年份 `.archive-year`（padding-bottom 6px）。任何新分隔线都用这一款。

### 5.2 标签胶囊
- 形状：`.content a.tag-pill`（带 `.content` 前缀压过主题的 `.content a { padding:4px }`，否则胶囊被压短）：`border-radius: 999px; padding: 1px 12px; font-size: 0.85rem;`，右间距 8px。
- 颜色按顺序粉蓝交替：奇数粉（`#fbe4ee`/`#b0577e`），偶数蓝（`#cfe5f4`/`#4f7392`）。
- 禁止 `[# ]`、`{ }` 等装饰符号（用 `::before/::after content:none` 挡掉）。
- 悬停：`filter: brightness(0.96)`。
- **Archive/标签列表页**：`.archive-date` 固定宽 56px 钉住标题起始位置；`.archive-tags { margin-top: 2px; margin-left: 66px }`（56+10 间距）让标签与标题左缘对齐、紧贴标题；标签格式与正文一致（不缩小不变淡），粉蓝交替色不变。

### 5.3 翻页按钮 `.post-nav-btn`
按钮区顶部有全站同款虚线：`border-top: 2px dashed #e8b9cc` + `padding-top: 28px`（虚线与按钮间距）。
虚线胶囊：2px dashed `#e8b9cc`、圆角 999px、内边距 10px 28px、字色 `#b0577e`、底色 `rgba(251,228,238,.35)`；悬停底色变实 `#fbe4ee` + 上浮 2px。两按钮**两端对齐**：实现方式是模板里给按钮加 `post-nav-prev` / `post-nav-next` 类，`.post-nav-next { margin-left: auto }` 推到最右——单独的下一篇在右、单独的上一篇在左、两个都在时一左一右（不要用 `space-between`，单按钮时会贴错边）。**方向语义**：上一篇=更旧的文章、下一篇=更新的文章；Hugo 的 `.Prev` 指向更旧的、`.Next` 指向更新的（和直觉相反），所以模板里「← 上一篇」用 `$sibs.Prev`、「下一篇 →」用 `$sibs.Next`，别写反。上下留白 90px / 110px。手机端缩小一号：内边距 6px 18px、字号 0.85rem、描边 1.5px、上下留白 60px / 80px。注意选择器必须是 `.post-nav`（写成 `.nav` 会撞主题顶部导航样式且失效）。

### 5.4 页脚（三种形态，别混用）
1. **首页**：固定屏幕底部、整条铺满；内容**贴右**（`max-width: var(--content-width)` 居中 + `flex-end`，右缘与正文对齐），文字与深色按钮间距 12px。
2. **文章/相册/关于**：流动页脚，跟在正文后；内层 `max-width: var(--content-width)` 居中，内容**靠右**对齐（右缘=正文右缘）；文字与深色按钮间距 12px。
3. **列表页（标签、归档）**：只有右下角迷你深色按钮 `.footer-mini`（fixed，right 14px / bottom 10px）。
- 页脚文案：`© 年份 · NDays いいね······`；**いいね······ 必须是纯文字，不得做成链接**；无 RSS 图标。

### 5.5 看板娘 / 小人（红线组件）
- 一律 `height` 控制 + `width: auto` + `aspect-ratio` 钉死原始比例，**绝不拉伸变形**；需要加 `!important` 豁免 `.content img` 通用规则时必须加。
- 首页右下 `.mascot`：fixed，高 PC 18vh / 手机 17vh，图 `/images/mascot-nobubble.png`（835×667），上方代码绘制想法气泡 `.mascot-bubble`（白底、`#d5dae2` 描边、border-radius 50%）+ 两颗递减圆点。气泡大小改 `.mascot-bubble` 的 width/height 百分比；文字改 `hugo.toml` → `params.mascot.text`。
- About 左下 `.mascot-left`：fixed，高 PC 33vh / 手机 32vh，图 `/images/toukan.png`。
- Archive 右上 `.archive-mascot`：外层盒子 `height:0`，图绝对定位悬浮（64×92，手机 50×72），**不得占布局高度**（虚线位置不能被挤动）。

### 5.6 正文图片
- 单张：`max-width: min(60%, 480px)`、左缩进 2em、圆角 6px；手机铺满、无缩进。
- 多张连续：自动三列宫格（gap 8px）；恰好 4 张→2×2；手机一律两列、gap 6px。
- 带 `width` 属性的小表情包：inline 跟文字同行。
- **绝不修改用户的图片文件本身**（不裁剪、不压缩、不重命名；需要处理只能新建副本并先征得同意）。

### 5.7 顶栏导航（2026-09-21 重设计，覆盖模板 `layouts/partials/nav-header.html`）
- 结构：左侧站名品牌 `.nav-brand`（粉描边白色小圆点记号 + 站名，圆点呼应想法气泡；站名自动取 hugo.toml 的 title），右侧菜单 `.nav-links`（无编号，全小写，菜单名在 hugo.toml `[menu.nav]` 配置）。
- 不再显示面包屑和当前文章标题；当前栏目自动加粗 + 粉色虚线下划线（悬停时虚线从左滑出）。
- 手机端：间距收紧。选择器用 `.site-nav`，勿用 `.nav`（会撞主题顶部导航样式）。

- 滚动条：主题默认隐藏（`::-webkit-scrollbar { width: 0 }`），custom.css 已恢复为 8px 粉色细条（`#e8b9cc`），勿删。

### 5.9 注释气泡 shortcode `tip`（移动端可用的 title 替代）
- 背景：`<span title="...">` 在手机上不显示（触屏没有 hover）。
- 用法：`{{</* tip note="注释文字" */>}}正文文字{{</* /tip */>}}`，渲染为 `<u class="tip" tabindex="0" data-tip="...">`。
- 样式：正文带下划线；桌面悬停 / 手机点按弹出白色粉边小气泡（想法气泡风），点别处关闭。
- 样式表在 custom.css 的 `.content .tip` 区块。

### 5.8 图库卡片 `.gallery-card`
封面 `aspect-ratio: 4/3` + `object-fit: cover`、圆角 10px、1px 淡灰描边；悬停 `scale(1.03)`；相册名 1.1rem bold 粉色 `#d490a6`。桌面 `repeat(auto-fill, minmax(240px,1fr))` gap 28px；手机固定两列 gap 14px。相册内页图片墙必须保留灯箱（图库首页卡片不加，避免拦截点击）。

### 5.10 文章末尾表情回应 `.post-reactions`
- 游客无登录可点，数据存 Firebase Realtime Database。模板 `layouts/partials/reactions.html`、逻辑 `static/js/reactions.js`，仅在 posts 文章页 post-nav 之前显示。
- 交互：初始只有「＋」方框；点「＋」弹出表情库；选中即追加并收起。**不显示数字**，表情**严格按每次点击的先后穿插排列**（每次点击单独占一位，点 🥳🍑🥳 就显示 🥳🍑🥳），全站共享、实时更新、可反复点。
- 数据结构：`reactions/<文章ID(base64)>/log/<pushId> = 表情key(base64)`——每次点击 push 一条，pushId 天然按时间排序；历史遗留的 `{n,t}` 次数格式仍兼容渲染（成组排在最前）。Rules 校验：仅允许新增（`!data.exists()`）、值为 4–16 位 base64url 字符串。
- 样式：**Twemoji 扁平风 SVG**，自托管在 `static/images/emoji/<codepoint>.svg`（来源 cdnjs twemoji 14.0.2；🩵🩷 等 Unicode15 来自 jsdelivr jdecked/twemoji@15.1.0；文件名=表情字符的十六进制 codepoint 用 `-` 连接、去掉 `fe0f`），不依赖系统 emoji 字体。换表情两步：改 reactions.js 的 `EMOJIS` 数组 + 下载对应 svg（Rules 不用动）。
- 尺寸：容器 `max-width: 420px` 居中（手机自然撑满，PC 稍宽于手机）、2px 虚线粉 `#e8b9cc` 圆角 14px、内边距 8px 14px（上下对称）；「＋」白底 34px 方框（描边 `#d5dae2`，悬停主粉 `#d490a6` 上浮）；表情本体 22px，表情库里 24px，白色胶囊条；新表情有 pop 动画（`reaction-pop`）。无任何文字说明。
- 折叠：表情超过 **3 排**时自动折叠（`.folded`，表情区 `max-height: 80px` + overflow hidden 裁掉最旧的排，无渐隐效果、直接裁切；新点击时 JS 自动滚到最底部保证最新表情可见），右侧出现展开小按钮（`.can-fold` 才显示），点击展开全部（`.expanded`）。**每排最多 12 个**：表情区 `max-width: 341px`（12×22 + 11×7）锁死，窄屏自动减少，折叠排数计算与换行天然一致。检测逻辑在 reactions.js 的 `updateFold()`：按固定尺寸（22px+7px 间距）算排数比较，比量 DOM 可靠。表情区（`.post-reaction-area`）与「＋/箭头」按钮（`.post-reaction-controls`）是分开的两层。
- 展开按钮样式：26px 白色圆形、1.5px 粉虚线描边 `#e8b9cc`、内置 SVG 圆头 V 形箭头（灰粉 `#b9a0ac`）；悬停变主粉 `#d490a6` + 粉底 `#fbe4ee` + 上浮 1px；展开时箭头以带回弹的缓动旋转 -180°（`cubic-bezier(0.34,1.4,0.64,1)`）。方向由 CSS 类控制（JS 不再切换文字，避免覆盖 SVG）。
- **缓存教训**：custom.css 与 reactions.js 的引用都带版本参数 `?v=20260923`（head.html 覆盖层 + reactions.html），改样式/JS 后必须递增版本号，否则浏览器用旧缓存会出现「表情巨大无样式、折叠失效」等诡异现象。

## 6. 开发守则（硬性）

1. 主题目录 `themes/hugo-toigian/` 不改；覆盖层：根目录 `layouts/`、`i18n/`、`static/css/custom.css`。
2. i18n 实际生效文件是 `i18n/zh-cn.toml`（locale=zh-cn），改 en.toml 无效。
3. **改 toml/json 一律用 Edit 工具**；严禁 PowerShell `Set-Content` 写 UTF-8（会引入 BOM 导致全站 500）。
4. 布局模板选择器注意：文章内容外层是 `<article>` 不是 `<main>`。
5. 字数统计用 `{{ .Content | plainify | countrunes }}`（`.WordCount` 中文不准），格式「N字」，仅 posts 区显示。
6. 本地预览：`hugo server`，`http://127.0.0.1:1313`；图库新增 static 图片不生效时 touch 对应 `_index.md` 或重启。
7. 新增任何样式前先查本文件；改完样式**同步更新本文件对应条目**。
8. 发布目标：GitHub Pages（yuuuutsu/yuuuutsu.github.io）。
