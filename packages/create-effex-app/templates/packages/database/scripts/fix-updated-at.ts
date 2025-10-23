#!/usr/bin/env tsx

import { readFileSync, writeFileSync } from 'node:fs'
import { dirname, join } from 'node:path'
import { fileURLToPath } from 'node:url'

const __filename = fileURLToPath(import.meta.url)
const __dirname = dirname(__filename)

const SCHEMA_PATH = join(__dirname, '../src/generated/drizzle/schema.ts')

function fixUpdatedAtFields(): void {
  console.log('🔧 Fixing updatedAt fields in generated Drizzle schema...')

  try {
    let schemaContent = readFileSync(SCHEMA_PATH, 'utf-8')

    let changesCount = 0

    const updatedAtPattern = /(\s+updatedAt:\s*timestamp\([^)]+\)\.notNull\(\))(?!\.\$onUpdate)/g

    schemaContent = schemaContent.replace(updatedAtPattern, match => {
      changesCount++
      return `${match}.$onUpdate(() => new Date())`
    })

    writeFileSync(SCHEMA_PATH, schemaContent, 'utf-8')

    if (changesCount > 0) {
      console.log(`✅ Successfully added $onUpdate to ${changesCount} updatedAt field(s)`)
    } else {
      console.log(
        'ℹ️  No updatedAt fields needed modification (already have $onUpdate or not found)'
      )
    }
  } catch (error) {
    console.error('❌ Error fixing updatedAt fields:', error)
    process.exit(1)
  }
}

fixUpdatedAtFields()

export { fixUpdatedAtFields }

