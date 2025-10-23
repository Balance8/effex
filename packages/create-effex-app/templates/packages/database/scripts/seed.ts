import { db, pool } from '../src/drizzle-client'
import { Post, User } from '../src/generated/drizzle/schema'

async function main() {
  console.log('🌱 Seeding database...')

  const users = await db.insert(User).values([
    {
      email: 'alice@example.com',
      name: 'Alice',
    },
    {
      email: 'bob@example.com',
      name: 'Bob',
    },
  ]).returning()

  await db.insert(Post).values([
    {
      title: 'First Post',
      content: 'This is Alice\'s first post',
      published: true,
      authorId: users[0].id,
    },
    {
      title: 'Draft Post',
      content: 'This is a draft',
      published: false,
      authorId: users[0].id,
    },
    {
      title: 'Bob\'s Post',
      content: 'Hello from Bob',
      published: true,
      authorId: users[1].id,
    },
  ])

  console.log('✅ Database seeded successfully')
}

main()
  .catch(error => {
    console.error('❌ Error seeding database:', error)
    process.exit(1)
  })
  .finally(async () => {
    await pool.end()
    process.exit(0)
  })
