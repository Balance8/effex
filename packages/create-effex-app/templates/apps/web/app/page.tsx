import { ArrowRightIcon } from 'lucide-react'

import { Card, CardDescription, CardHeader, CardTitle } from '@workspace/ui/components/card'

export default function Home() {
  return (
    <main className='flex min-h-screen flex-col items-center justify-center p-24'>
      <div className='z-10 w-full max-w-5xl items-center justify-between font-mono text-sm'>
        {/* biome-ignore lint/correctness/noUndeclaredVariables: template variable */}
        <h1 className='mb-4 font-bold text-4xl'>Welcome to {{ projectName }}</h1>
        <p className='mb-8 text-lg'>Your project has been successfully created with effex!</p>
        <div className='grid gap-4 md:grid-cols-2 lg:grid-cols-3'>
          <LinkCard
            description='The React Framework for the Web'
            href='https://nextjs.org/docs'
            title='Next.js'
          />
          <LinkCard
            description='Next-generation ORM for Node.js & TypeScript'
            href='https://www.prisma.io/docs'
            title='Prisma'
          />
          <LinkCard
            description='The best way to build robust apps in TypeScript'
            href='https://effect.website'
            title='Effect-TS'
          />
          <LinkCard
            description='Incremental bundler and build system'
            href='https://turbo.build/repo/docs'
            title='Turbo'
          />
          <LinkCard
            description='Fast formatter and linter'
            href='https://biomejs.dev'
            title='Biome'
          />
          <LinkCard
            description='Strict code quality rules'
            href='https://www.npmjs.com/package/ultracite'
            title='Ultracite'
          />
        </div>
      </div>
    </main>
  )
}

function LinkCard({
  title,
  description,
  href,
}: {
  title: string
  description: string
  href: string
}) {
  return (
    <a
      className='group transition-transform hover:scale-[1.02]'
      href={href}
      rel='noopener noreferrer'
      target='_blank'
    >
      <Card className='h-full transition-colors hover:border-primary/50'>
        <CardHeader>
          <CardTitle className='flex items-center justify-between'>
            {title}
            <ArrowRightIcon className='size-4 transition-transform group-hover:translate-x-1' />
          </CardTitle>
          <CardDescription>{description}</CardDescription>
        </CardHeader>
      </Card>
    </a>
  )
}
