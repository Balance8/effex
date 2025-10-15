import { PrismaClient } from '../generated/prisma'

const prisma = new PrismaClient()

async function main() {
  console.log('🌱 Seeding database...')

  const user = await prisma.user.create({
    data: {
      email: 'user@example.com',
      name: 'Example User',
    },
  })

  console.log('✅ Created user:', user)
  console.log('🎉 Seeding complete!')
}

main()
  .catch(e => {
    console.error('❌ Seeding failed:', e)
    process.exit(1)
  })
  .finally(async () => {
    await prisma.$disconnect()
  })
