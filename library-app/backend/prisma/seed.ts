import { PrismaClient } from '@prisma/client'
import bcrypt from 'bcryptjs'

const db = new PrismaClient()

async function main() {
  await db.setting.upsert({
    where: { key: 'loanDurationDays' },
    update: {},
    create: { key: 'loanDurationDays', value: '14' },
  })

  await db.setting.upsert({
    where: { key: 'maxLoansPerMember' },
    update: {},
    create: { key: 'maxLoansPerMember', value: '3' },
  })

  const passwordHash = await bcrypt.hash('admin1234', 10)
  await db.user.upsert({
    where: { email: 'admin@library.local' },
    update: {},
    create: {
      email: 'admin@library.local',
      passwordHash,
      role: 'ADMIN',
    },
  })

  console.log('Seed complete: settings + admin user created')
}

main()
  .catch((err) => { console.error(err); process.exit(1) })
  .finally(() => db.$disconnect())
