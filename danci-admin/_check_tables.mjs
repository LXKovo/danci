import postgres from 'postgres';

const url = process.env.DATABASE_URL;
const sql = postgres(url, { prepare: false });

async function showColumns(table) {
  const cols = await sql`
    select column_name, data_type
    from information_schema.columns
    where table_schema = 'public' and table_name = ${table}
    order by ordinal_position
  `;
  console.log(`\n[${table}] 列:`, cols.map((c) => `${c.column_name}(${c.data_type})`).join(', '));
}

try {
  for (const t of ['admin-users', 'admin-session', 'books', 'words']) {
    await showColumns(t);
  }

  console.log('\n=== 1) select * from books order by created_at desc ===');
  try {
    const rows = await sql`select * from books order by created_at desc`;
    console.log('OK, 返回', rows.length, '行');
    console.log(JSON.stringify(rows[0], null, 2));
  } catch (e) {
    console.log('!! 报错:', e.message);
  }

  console.log('\n=== 2) getCurrentAdmin 的 innerJoin 查询 ===');
  try {
    const rows = await sql`
      select u.id, u.name, u.email, u.role
      from "admin-session" s
      inner join "admin-users" u on s.admin_id = u.id
      limit 1
    `;
    console.log('OK, 返回', rows.length, '行');
    console.log(JSON.stringify(rows[0], null, 2));
  } catch (e) {
    console.log('!! 报错:', e.message);
  }

  console.log('\n=== 3) 检查 admin-session 的 token_hash 与 expires_at ===');
  try {
    const rows = await sql`select token_hash, expires_at, created_at from "admin-session" limit 1`;
    console.log('OK:', JSON.stringify(rows[0], null, 2));
  } catch (e) {
    console.log('!! 报错:', e.message);
  }
} finally {
  await sql.end();
}