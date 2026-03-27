import { NextResponse } from 'next/server'
import { clearAuthCookies } from '@/shared/utils/cookies'

export async function POST() {
  const response = NextResponse.json({ ok: true }, { status: 200 })
  clearAuthCookies(response)
  return response
}
