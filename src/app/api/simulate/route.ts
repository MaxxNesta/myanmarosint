import { NextRequest, NextResponse } from 'next/server'
import { z } from 'zod'
import { runMonteCarlo } from '@/lib/simulation'
import prisma from '@/lib/db'
import { Prisma } from '@prisma/client'
const bodySchema = z.object({
  initialConflict:        z.number().min(0).max(1).default(0.75),
  initialEconomy:         z.number().min(0).max(1).default(0.30),
  externalSupport:        z.boolean().default(false),
  internationalSanctions: z.boolean().default(true),
  ceasefireAttempt:       z.boolean().default(false),
  timeHorizonDays:        z.union([z.literal(30), z.literal(60), z.literal(90), z.literal(180)]).default(90),
  iterations:             z.number().min(100).max(5000).default(1000),
})

export async function POST(req: NextRequest) {
  let body: unknown
  try {
    body = await req.json()
  } catch {
    return NextResponse.json({ error: 'Invalid JSON body' }, { status: 400 })
  }

  const parsed = bodySchema.safeParse(body)
  if (!parsed.success) {
    return NextResponse.json({ error: parsed.error.flatten() }, { status: 400 })
  }

  const params = parsed.data
  const result = runMonteCarlo(params)

  // Persist simulation result (fire-and-forget)
  prisma.simulationResult
    .create({
      data: {
        scenarioParams: params,
        results: result as unknown as Prisma.InputJsonValue,
        iterations:     params.iterations,
      },
    })
    .catch(() => {})

  return NextResponse.json(result)
}
