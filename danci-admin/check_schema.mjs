import postgres from "postgres";

const sql = postgres(
  "postgresql://postgres.gdoguoxhbiauqvdyqmri:LXK!qwer1314@aws-0-ap-south-1.pooler.supabase.com:5432/postgres",
  { prepare: false }
);

try {
  // Check books table columns
  const columns = await sql`
    SELECT column_name, data_type, is_nullable 
    FROM information_schema.columns 
    WHERE table_name = 'books' 
    ORDER BY ordinal_position
  `;
  console.log("Books columns:", JSON.stringify(columns, null, 2));

  // Try a simple query
  const result = await sql`SELECT * FROM "books" LIMIT 1`;
  console.log("Query OK, rows:", result.length);
  if (result.length > 0) {
    console.log("Row:", JSON.stringify(result[0], (key, val) => 
      typeof val === 'bigint' ? val.toString() : val
    ));
  }
} catch (e) {
  console.error("Error:", e.message);
  console.error("Code:", e.code);
} finally {
  await sql.end();
}