import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@/utils/supabase/server'

// GET /api/health - System health check endpoint
export async function GET() {
  try {
    // Simple database connection test
    const supabase = await createClient()
    const { error } = await supabase
      .from('profiles')
      .select('count')
      .limit(1)
      .single()

    if (error) {
      return NextResponse.json(
        { status: 'error', message: 'Database connection failed' },
        { status: 500 }
      )
    }

    return NextResponse.json({
      status: 'ok',
      timestamp: new Date().toISOString(),
      database: 'connected'
    })
  } catch (error) {
    return NextResponse.json(
      { status: 'error', message: 'Health check failed' },
      { status: 500 }
    )
  }
}

// HEAD /api/health - Lightweight health check for load balancers
export async function HEAD(request: NextRequest) {
  try {
    // Quick database ping
    const supabase = await createClient()
    const { error } = await supabase
      .from('profiles')
      .select('count')
      .limit(1)
      .single()
    
    if (error) {
      return new NextResponse(null, { status: 503 })
    }
    
    return new NextResponse(null, { status: 200 })
  } catch (error) {
    return new NextResponse(null, { status: 503 })
  }
} 