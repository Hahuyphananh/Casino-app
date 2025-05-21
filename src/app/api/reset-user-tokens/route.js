import { auth } from "@clerk/nextjs"; // ✅ utilise le bon auth pour App Router
import { sql } from "@vercel/postgres";

export async function POST() {
  const { userId } = auth(); // 🔐 récupère l'utilisateur connecté via Clerk

  if (!userId) {
    return new Response(JSON.stringify({ error: "Non autorisé" }), {
      status: 401,
      headers: { "Content-Type": "application/json" },
    });
  }

  const existing = await sql`
    SELECT id FROM user_tokens WHERE user_id = ${userId}
  `;

  let result;
  if (existing.rowCount === 0) {
    result = await sql`
      INSERT INTO user_tokens (user_id, balance)
      VALUES (${userId}, 1000.00)
      RETURNING balance
    `;
  } else {
    result = await sql`
      UPDATE user_tokens
      SET balance = 1000.00
      WHERE user_id = ${userId}
      RETURNING balance
    `;
  }

  return new Response(JSON.stringify({ balance: result.rows[0].balance }), {
    status: 200,
    headers: { "Content-Type": "application/json" },
  });
}
