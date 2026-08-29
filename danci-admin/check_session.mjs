import postgres from "postgres";

const sql = postgres(
  "postgresql://postgres.gdoguoxhbiauqvdyqmri:LXK!qwer1314@aws-0-ap-south-1.pooler.supabase.com:5432/postgres",
  { prepare: false }
);

try {
  // Check admin-session table columns
  const columns = await sql`
    SELECT column_name, data_type, is_nullable 
    FROM information_schema.columns 
    WHERE table_name = 'admin-session' 
    ORDER BY ordinal_position
  `;
  console.log("admin-session columns:", JSON.stringify(columns, null, 2));

  // Check admin-users table columns
  const columns2 = await sql`
    SELECT column_name, data_type, is_nullable 
    FROM information_schema.columns 
    WHERE table_name = 'admin-users' 
    ORDER BY ordinal_position
  `;
  console.log("admin-users columns:", JSON.stringify(columns2, null, 2));
} catch (e) {
  console.error("Error:", e.message);
  console.error("Code:", e.code);
} finally {
  await sql.end();
}