import { describe, it, expect } from 'vitest'
import {
  BookSchema, CreateBookSchema, UpdateBookSchema,
  MemberSchema, CreateMemberSchema,
  LoanSchema, CreateLoanSchema,
  SettingSchema, UpdateSettingsSchema,
  LoanStatusSchema, MemberStatusSchema, UserRoleSchema,
} from '@library/shared'

describe('BookSchema', () => {
  const validBook = {
    id: 'cuid-abc123',
    isbn: '978-0-06-112008-4',
    title: 'To Kill a Mockingbird',
    author: 'Harper Lee',
    category: 'Fiction',
    publisher: 'Harper Perennial',
    year: 1960,
    totalCopies: 3,
    availableCopies: 2,
    description: 'A classic novel.',
    coverUrl: 'https://example.com/cover.jpg',
    active: true,
    createdAt: new Date(),
    updatedAt: new Date(),
  }

  it('parses a valid book', () => {
    expect(() => BookSchema.parse(validBook)).not.toThrow()
  })

  it('rejects a book with no title', () => {
    expect(() => BookSchema.parse({ ...validBook, title: '' })).toThrow()
  })

  it('rejects a book with negative availableCopies', () => {
    expect(() => BookSchema.parse({ ...validBook, availableCopies: -1 })).toThrow()
  })

  it('CreateBookSchema allows omitting id and timestamps', () => {
    const input = { title: 'Dune', author: 'Frank Herbert', totalCopies: 2 }
    const result = CreateBookSchema.parse(input)
    expect(result.title).toBe('Dune')
    expect(result.totalCopies).toBe(2)
  })

  it('UpdateBookSchema makes all fields optional', () => {
    expect(() => UpdateBookSchema.parse({})).not.toThrow()
    expect(() => UpdateBookSchema.parse({ title: 'New Title' })).not.toThrow()
  })
})

describe('MemberSchema', () => {
  const validMember = {
    id: 'cuid-def456',
    memberNumber: 'M-001',
    name: 'Ana García',
    email: 'ana@example.com',
    phone: '+34 600 000 000',
    address: 'Calle Mayor 1',
    status: 'ACTIVE' as const,
    joinedAt: new Date(),
    createdAt: new Date(),
    updatedAt: new Date(),
  }

  it('parses a valid member', () => {
    expect(() => MemberSchema.parse(validMember)).not.toThrow()
  })

  it('rejects invalid email', () => {
    expect(() => MemberSchema.parse({ ...validMember, email: 'not-an-email' })).toThrow()
  })

  it('rejects invalid status', () => {
    expect(() => MemberSchema.parse({ ...validMember, status: 'DELETED' })).toThrow()
  })

  it('CreateMemberSchema requires name and email', () => {
    expect(() => CreateMemberSchema.parse({ name: 'Test', email: 'test@test.com' })).not.toThrow()
    expect(() => CreateMemberSchema.parse({ name: 'Test' })).toThrow()
  })
})

describe('LoanSchema', () => {
  const validLoan = {
    id: 'cuid-ghi789',
    bookId: 'cuid-abc123',
    memberId: 'cuid-def456',
    loanDate: new Date(),
    dueDate: new Date(Date.now() + 14 * 86400_000),
    returnDate: null,
    status: 'ACTIVE' as const,
    createdAt: new Date(),
    updatedAt: new Date(),
  }

  it('parses a valid loan', () => {
    expect(() => LoanSchema.parse(validLoan)).not.toThrow()
  })

  it('rejects invalid status', () => {
    expect(() => LoanSchema.parse({ ...validLoan, status: 'PENDING' })).toThrow()
  })

  it('CreateLoanSchema requires bookId and memberId', () => {
    const input = { bookId: 'b1', memberId: 'm1', dueDate: new Date() }
    expect(() => CreateLoanSchema.parse(input)).not.toThrow()
    expect(() => CreateLoanSchema.parse({ bookId: 'b1' })).toThrow()
  })
})

describe('SettingSchema', () => {
  it('parses a valid setting row', () => {
    const s = { key: 'loanDurationDays', value: '14', updatedAt: new Date() }
    expect(() => SettingSchema.parse(s)).not.toThrow()
  })

  it('UpdateSettingsSchema validates numeric config values', () => {
    expect(() => UpdateSettingsSchema.parse({ loanDurationDays: 21 })).not.toThrow()
    expect(() => UpdateSettingsSchema.parse({ maxLoansPerMember: 5 })).not.toThrow()
    expect(() => UpdateSettingsSchema.parse({ loanDurationDays: -1 })).toThrow()
    expect(() => UpdateSettingsSchema.parse({ loanDurationDays: 1.5 })).toThrow()
  })
})

describe('Enums', () => {
  it('LoanStatusSchema accepts valid values', () => {
    expect(() => LoanStatusSchema.parse('ACTIVE')).not.toThrow()
    expect(() => LoanStatusSchema.parse('RETURNED')).not.toThrow()
    expect(() => LoanStatusSchema.parse('OVERDUE')).not.toThrow()
    expect(() => LoanStatusSchema.parse('PENDING')).toThrow()
  })

  it('MemberStatusSchema accepts valid values', () => {
    expect(() => MemberStatusSchema.parse('ACTIVE')).not.toThrow()
    expect(() => MemberStatusSchema.parse('SUSPENDED')).not.toThrow()
    expect(() => MemberStatusSchema.parse('DELETED')).toThrow()
  })

  it('UserRoleSchema accepts valid values', () => {
    expect(() => UserRoleSchema.parse('ADMIN')).not.toThrow()
    expect(() => UserRoleSchema.parse('MEMBER')).not.toThrow()
    expect(() => UserRoleSchema.parse('GUEST')).toThrow()
  })
})
