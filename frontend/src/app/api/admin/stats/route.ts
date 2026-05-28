import { NextResponse } from "next/server"

// Admin key for authentication
const ADMIN_KEY = process.env.ADMIN_STATS_KEY || "admin-stats-2025"

// PostgreSQL connection info
const DB_HOST = process.env.DB_HOST || "localhost"
const DB_PORT = parseInt(process.env.DB_PORT || "5432")
const DB_USER = process.env.DB_USER || "destiny"
const DB_PASS = process.env.DB_PASS || "destiny2025"
const DB_NAME = process.env.DB_NAME || "destiny"

export async function GET(request: Request) {
  const url = new URL(request.url)
  const key = url.searchParams.get("key")

  if (key !== ADMIN_KEY) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
  }

  try {
    // Dynamic import to avoid bundling pg in client
    const { Client } = await import("pg")
    const client = new Client({
      host: DB_HOST,
      port: DB_PORT,
      user: DB_USER,
      password: DB_PASS,
      database: DB_NAME,
    })

    await client.connect()

    // Get total users
    const usersResult = await client.query("SELECT COUNT(*) as count FROM users")
    const totalUsers = parseInt(usersResult.rows[0].count)

    // Get total readings
    const readingsResult = await client.query("SELECT COUNT(*) as count FROM readings")
    const totalReadings = parseInt(readingsResult.rows[0].count)

    // Get total orders
    const ordersResult = await client.query("SELECT COUNT(*) as count FROM orders")
    const totalOrders = parseInt(ordersResult.rows[0].count)

    // Get paid users (users with orders)
    const paidResult = await client.query(
      "SELECT COUNT(DISTINCT user_id) as count FROM orders WHERE status = 'paid'"
    )
    const paidUsers = parseInt(paidResult.rows[0].count)

    // Get total revenue (sum of paid orders)
    const revenueResult = await client.query(
      "SELECT COALESCE(SUM(total_cny), 0) as total FROM orders WHERE status = 'paid'"
    )
    const totalRevenue = parseFloat(revenueResult.rows[0].total)

    // Get recent users
    const recentResult = await client.query(
      "SELECT email, created_at FROM users ORDER BY created_at DESC LIMIT 10"
    )

    // Get recent orders
    const recentOrdersResult = await client.query(
      "SELECT id, user_id, total_cny, status, created_at FROM orders ORDER BY created_at DESC LIMIT 10"
    )

    await client.end()

    return NextResponse.json({
      totalUsers,
      totalReadings,
      totalOrders,
      paidUsers,
      totalRevenue,
      recentUsers: recentResult.rows,
      recentOrders: recentOrdersResult.rows,
    })
  } catch (error: any) {
    console.error("Admin stats error:", error)
    return NextResponse.json(
      { error: "Failed to fetch stats", detail: error.message },
      { status: 500 }
    )
  }
}
