// 临时脚本：检查远程数据库表状态
require('dotenv').config({ path: require('path').join(__dirname, '..', '.env') });
const postgres = require('postgres');

async function main() {
  const url = process.env.POSTGRES_URL;
  const masked = url.replace(/:[^:@]+@/, ':***@');
  console.log('连接地址:', masked);

  const sql = postgres(`${url}?sslmode=require`, { max: 1, timeout: 10 });

  try {
    const [{ version }] = await sql`SELECT version();`;
    console.log('✅ 连接成功');
    console.log('版本:', version.split(',')[0]);

    const tables = await sql`
      SELECT table_name
      FROM information_schema.tables
      WHERE table_schema = 'public'
      ORDER BY table_name;
    `;
    console.log('\npublic schema 表:', tables.map((t) => t.table_name).join(', ') || '(空)');

    for (const table of ['books', 'words', 'User', 'study_progress']) {
      const exists = tables.some((t) => t.table_name === table);
      if (exists) {
        const [{ c }] = await sql`SELECT count(*)::int AS c FROM ${sql(table)}`;
        console.log(`  ✔ ${table}  存在（${c} 条记录）`);
      } else {
        console.log(`  ✘ ${table}  不存在`);
      }
    }

    // 打印新表字段结构
    const cols = await sql`
      SELECT table_name, column_name, data_type, is_nullable, column_default
      FROM information_schema.columns
      WHERE table_name IN ('study_progress', 'User')
      ORDER BY table_name, ordinal_position;
    `;
    console.log('\n新表字段结构:');
    for (const c of cols) {
      console.log(
        `  ${c.table_name}.${c.column_name}  ${c.data_type}  ${c.is_nullable === 'YES' ? 'NULL' : 'NOT NULL'}  ${c.column_default ?? ''}`,
      );
    }
  } catch (err) {
    console.error('❌ 连接失败:', err.message);
    process.exitCode = 1;
  } finally {
    await sql.end();
  }
}

main();
