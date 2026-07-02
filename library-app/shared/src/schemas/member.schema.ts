import { z } from 'zod'
import { MemberStatusSchema } from './book.schema.ts'

export const MemberSchema = z.object({
  id: z.string(),
  memberNumber: z.string().min(1),
  name: z.string().min(1),
  email: z.string().email(),
  phone: z.string().optional().nullable(),
  address: z.string().optional().nullable(),
  status: MemberStatusSchema,
  joinedAt: z.date(),
  createdAt: z.date(),
  updatedAt: z.date(),
})

export const CreateMemberSchema = z.object({
  name: z.string().min(1),
  email: z.string().email(),
  phone: z.string().optional(),
  address: z.string().optional(),
})

export const UpdateMemberSchema = CreateMemberSchema.partial().extend({
  status: MemberStatusSchema.optional(),
})

export type Member = z.infer<typeof MemberSchema>
export type CreateMember = z.infer<typeof CreateMemberSchema>
export type UpdateMember = z.infer<typeof UpdateMemberSchema>
