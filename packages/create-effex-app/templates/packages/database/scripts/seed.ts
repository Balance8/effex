import { drizzle } from 'drizzle-orm/postgres-js'
import postgres from 'postgres'

import { user } from '../src/schema'

const databaseUrl = process.env.DATABASE_URL

if (!databaseUrl) {
  throw new Error('DATABASE_URL environment variable is not set')
}

const client = postgres(databaseUrl)
const db = drizzle(client, { casing: 'snake_case' })

async function main() {
  console.log('🌱 Seeding database...')

  const [newUser] = await db
    .insert(user)
    .values({
      email: 'user@example.com',
      name: 'Example User',
    })
    .returning()

  console.log('✅ Created user:', newUser)
  console.log('🎉 Seeding complete!')
}

main()
  .catch(e => {
    console.error('❌ Seeding failed:', e)
    process.exit(1)
  })
  .finally(async () => {
    await client.end()
  })
