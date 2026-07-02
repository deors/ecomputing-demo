import { z } from 'zod'

export const SettingSchema = z.object({
  key: z.string().min(1),
  value: z.string(),
  updatedAt: z.date(),
})

export const UpdateSettingsSchema = z.object({
  loanDurationDays: z.number().int().min(1).optional(),
  maxLoansPerMember: z.number().int().min(1).optional(),
})

export type Setting = z.infer<typeof SettingSchema>
export type UpdateSettings = z.infer<typeof UpdateSettingsSchema>
