import { NextResponse } from "next/server"
import { timingSafeEqual } from "crypto"

function verifyAdminKey(provided: string | null): boolean {
  const expected = process.env.ADMIN_STATS_KEY || ""
  if (!provided || provided.length !== expected.length) return false
  try {
    return timingSafeEqual(Buffer.from(provided), Buffer.from(expected))
  } catch {
    return false
  }
}

// Reuse a connection pool across requests instead of creating a new Client each time
let _pool: any = null
function getPool() {
  if (_pool) return _pool
  const { Pool } = require("pg")
  _pool = new Pool({
    host: process.env.DB_HOST,
    port: parseInt(process.env.DB_PORT || "5432"),
    user: process.env.DB_USER,
    password: process.env.DB_PASS,
    database: process.env.DB_NAME || "destiny",
    max: 5,
  })
  return _pool
}

export async function GET(request: Request) {
  const key = request.headers.get("x-admin-key")

  if (!verifyAdminKey(key)) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
  }

  if (!process.env.DB_HOST || !process.env.DB_PASS) {
    return NextResponse.json({ error: "Server misconfigured" }, { status: 500 })
  }

  try {
    const pool = getPool()
    const client = await pool.connect()
    try {
      const [usersResult, readingsResult, ordersResult, paidResult, revenueResult, recentResult, recentOrdersResult] =
        await Promise.all([
          client.query("SELECT COUNT(*) as count FROM users"),
          client.query("SELECT COUNT(*) as count FROM readings"),
          client.query("SELECT COUNT(*) as count FROM orders"),
          client.query("SELECT COUNT(DISTINCT user_id) as count FROM orders WHERE status = 'paid'"),
          client.query("SELECT COALESCE(SUM(total_cny), 0) as total FROM orders WHERE status = 'paid'"),
          client.query("SELECT email, created_at FROM users ORDER BY created_at DESC LIMIT 10"),
          client.query("SELECT id, user_id, total_cny, status, created_at FROM orders ORDER BY created_at DESC LIMIT 10"),
        ])

      return NextResponse.json({
        totalUsers: parseInt(usersResult.rows[0].count),
        totalReadings: parseInt(readingsResult.rows[0].count),
        totalOrders: parseInt(ordersResult.rows[0].count),
        paidUsers: parseInt(paidResult.rows[0].count),
        totalRevenue: parseFloat(revenueResult.rows[0].total),
        recentUsers: recentResult.rows,
        recentOrders: recentOrdersResult.rows,
      })
    } finally {
      client.release()
    }
  } catch {
    return NextResponse.json({ error: "Failed to fetch stats" }, { status: 500 })
  }
}
