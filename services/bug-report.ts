import { useMutation } from '@tanstack/react-query'

import { api } from '@/lib/api'

export const BUG_SEVERITIES = ['CRITICAL', 'MAJOR', 'MINOR', 'COSMETIC'] as const

export type BugSeverity = (typeof BUG_SEVERITIES)[number]

export type BugReportInput = {
  name?: string
  email?: string
  title: string
  description: string
  severity: BugSeverity
  device?: string
}

export async function reportBug(input: BugReportInput) {
  const { data } = await api.post('/bug-report', input)
  return data
}

export const useReportBugMutation = () => {
  return useMutation({
    mutationFn: reportBug,
  })
}
