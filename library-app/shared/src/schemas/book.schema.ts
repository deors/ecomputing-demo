import { z } from 'zod'

export const LoanStatusSchema = z.enum(['ACTIVE', 'RETURNED', 'OVERDUE'])
export const MemberStatusSchema = z.enum(['ACTIVE', 'SUSPENDED'])
export const UserRoleSchema = z.enum(['ADMIN', 'MEMBER'])

export const BookSchema = z.object({
  id: z.string(),
  isbn: z.string().optional().nullable(),
  title: z.string().min(1),
  author: z.string().min(1),
  category: z.string().optional().nullable(),
  publisher: z.string().optional().nullable(),
  year: z.number().int().min(1000).max(9999).optional().nullable(),
  totalCopies: z.number().int().min(1),
  availableCopies: z.number().int().min(0),
  description: z.string().optional().nullable(),
  coverUrl: z.string().url().optional().nullable(),
  active: z.boolean(),
  createdAt: z.date(),
  updatedAt: z.date(),
})

export const CreateBookSchema = z.object({
  isbn: z.string().optional(),
  title: z.string().min(1),
  author: z.string().min(1),
  category: z.string().optional(),
  publisher: z.string().optional(),
  year: z.number().int().min(1000).max(9999).optional(),
  totalCopies: z.number().int().min(1).default(1),
  description: z.string().optional(),
  coverUrl: z.string().url().optional(),
})

export const UpdateBookSchema = CreateBookSchema.partial()

export type Book = z.infer<typeof BookSchema>
export type CreateBook = z.infer<typeof CreateBookSchema>
export type UpdateBook = z.infer<typeof UpdateBookSchema>
