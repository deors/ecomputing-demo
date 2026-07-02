import { z } from 'zod'
import { LoanStatusSchema } from './book.schema.ts'

export const LoanSchema = z.object({
  id: z.string(),
  bookId: z.string(),
  memberId: z.string(),
  loanDate: z.date(),
  dueDate: z.date(),
  returnDate: z.date().nullable(),
  status: LoanStatusSchema,
  createdAt: z.date(),
  updatedAt: z.date(),
})

export const CreateLoanSchema = z.object({
  bookId: z.string().min(1),
  memberId: z.string().min(1),
  dueDate: z.date().optional(),
})

export const ReturnLoanSchema = z.object({
  returnDate: z.date().optional(),
})

export type Loan = z.infer<typeof LoanSchema>
export type CreateLoan = z.infer<typeof CreateLoanSchema>
export type ReturnLoan = z.infer<typeof ReturnLoanSchema>
