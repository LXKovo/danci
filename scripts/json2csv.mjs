import { readFileSync, writeFileSync } from 'node:fs';
import { basename, dirname, extname, join } from 'node:path';

// 默认输入文件，可通过命令行参数覆盖
// 用法: node scripts/json2csv.mjs [输入路径] [输出路径]
const inputPath = process.argv[2] ?? 'd:\\LvMeng_Stuy\\ai-coding\\danci\\danci-admin\\temp\\PEPXiaoXue3_1.json';

// 从一段文本中提取多个拼接在一起的顶层 JSON 对象（形如 {} {} {}，对象之间无逗号）
function extractObjects(text) {
  const results = [];
  let depth = 0; // 花括号深度
  let inString = false; // 是否位于字符串内部
  let escaped = false; // 是否处于转义状态
  let start = -1; // 当前顶层对象的起始下标

  for (let i = 0; i < text.length; i++) {
    const ch = text[i];

    if (inString) {
      if (escaped) {
        escaped = false;
      } else if (ch === '\\') {
        escaped = true;
      } else if (ch === '"') {
        inString = false;
      }
      continue;
    }

    if (ch === '"') {
      inString = true;
    } else if (ch === '{') {
      if (depth === 0) start = i;
      depth++;
    } else if (ch === '}') {
      depth--;
      if (depth === 0 && start !== -1) {
        results.push(text.slice(start, i + 1));
        start = -1;
      }
    }
  }

  return results;
}

// 生成 CSV 单元格：所有字段都用双引号包裹，内部双引号按 RFC 4180 转义
function csvField(value) {
  return '"' + String(value).replace(/"/g, '""') + '"';
}

const raw = readFileSync(inputPath, 'utf8');
const records = extractObjects(raw).map((segment) => JSON.parse(segment));

const headers = ['wordRank', 'headWord', 'content', 'bookId'];
const lines = [headers.join(',')];

for (const rec of records) {
  const row = [
    rec.wordRank,
    rec.headWord,
    JSON.stringify(rec.content), // content 作为 JSON 字符串保存
    rec.bookId,
  ];
  lines.push(row.map(csvField).join(','));
}

const outputPath = process.argv[3] ?? join(dirname(inputPath), basename(inputPath, extname(inputPath)) + '.csv');
writeFileSync(outputPath, lines.join('\n') + '\n', 'utf8');

console.log(`已生成 CSV：${outputPath}`);
console.log(`共处理 ${records.length} 条记录`);