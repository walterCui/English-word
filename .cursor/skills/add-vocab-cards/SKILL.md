---
name: add-vocab-cards
description: >-
  Generate vocab flashcard data for the interactive HTML viewer.
  Use when user provides a new word list image, asks to add words, or mentions
  单词卡, 生词, vocab cards, add words to the flashcard app.
disable-model-invocation: true
---

# 添加单词卡

为 `index.html` 交互式单词卡网页生成新批次的单词数据。

## 项目结构

```
English/
├── index.html        # 模板（不要修改）
├── vocab-manifest.js       # 注册表（记录所有批次文件和序号范围）
├── vocab-001-100.js        # 第 1 批数据
├── vocab-001-100.md        # 第 1 批 Markdown
├── vocab-101-200.js        # 第 2 批数据（示例）
├── vocab-101-200.md        # 第 2 批 Markdown
└── ...
```

## 核心工作流

### 步骤 1: 获取单词列表

- 图片输入：`sips -s format jpeg input.HEIC --out input.jpg`，然后 Read 读取识别
- 文本/文件输入：直接提取
- 输出完整编号单词列表，让用户确认

### 步骤 2: 读取 manifest 确定序号

读取 `vocab-manifest.js`，取最后一条的 `range[1]` 作为已有最大序号。新批次从 `maxSeq + 1` 开始。

manifest 格式：
```javascript
window._vocabChunks = window._vocabChunks || [];
window._vocabManifest = [
  { file: "vocab-001-100.js", label: "第1批", range: [1, 100] },
  { file: "vocab-101-200.js", label: "第2批", range: [101, 200] }
];
window._vocabManifest.forEach(function(entry) {
  document.write('<script src="' + entry.file + '"><\/script>');
});
```

### 步骤 3: 生成样板卡

**先生成 1 张样板卡让用户 review，确认后再批量生成。**

### 步骤 4: 批量生成数据

每个单词是一个 JSON 对象，13 个字段：

```javascript
{
  "序号": 101,           // 整数，全局递增
  "单词": "apple",
  "分类": "水果",         // 自由命名，模板自动生成筛选标签
  "音标": "/ˈæpl/",      // 英式+美式，若相同只写一个
  "词性": "n.",
  "中文": "苹果",
  "词源/记忆技巧": "...", // 生动有趣，2-3 句，适合小学生
  "级别": "KET 核心词汇", // KET 核心词汇 / PET 核心词汇
  "常考题型": "...",
  "常见搭配": "...",      // 3-4 个搭配，中英对照
  "易混淆": "...",
  "例句": "...",          // 英文句子 + 中文翻译
  "真题考法": "..."
}
```

如果数量 >25，使用并行子任务（Task tool）分批生成，每批 25 个，返回 JSON 数组片段由主流程合并。

### 内容标准

- **音标**: 英式+美式（相同只写一个）
- **词源/记忆技巧**: 生动有趣，适合 G3-G6 小学生。可用词源故事、谐音法、拆分记忆、形象联想
- **PET/KET 考点**: 级别、常考题型（具体到 Part 和场景）、3-4 个搭配、易混淆对比、例句（英+中）、真题考法
- **语言风格**: 简单明了，面向孩子自学

### 步骤 5: 写入文件

**生成两个文件**（假设新批次是 101-200）：

**vocab-101-200.js** — 数据文件：
```javascript
window._vocabChunks = window._vocabChunks || [];
window._vocabChunks.push([
  { "序号": 101, "单词": "...", ... },
  // ...
]);
```

**vocab-101-200.md** — Markdown 文件，与之前批次格式一致。

### 步骤 6: 更新 manifest

在 `vocab-manifest.js` 的 `_vocabManifest` 数组中追加新条目：
```javascript
{ file: "vocab-101-200.js", label: "第2批", range: [101, 200] }
```

### 步骤 7: 验证

- 在浏览器中打开 `index.html` 验证
- 确认新分类标签出现、新单词可翻转查看

## 注意事项

- `index.html` 是纯模板，永远不要修改
- 分类名称自由命名，模板自动检测生成筛选标签
- 序号全局递增，从 manifest 最后一条的 range 推算
- 每批独立文件，不修改已有批次的数据
