export default function Home() {
  return (
    <main className='flex min-h-screen flex-col items-center justify-center p-24'>
      <div className='z-10 w-full max-w-5xl items-center justify-between font-mono text-sm'>
        {/* biome-ignore lint/correctness/noUndeclaredVariables: template variable */}
        <h1 className='mb-4 font-bold text-4xl'>Welcome to {{ projectName }}</h1>
        <p className='mb-8 text-lg'>Your project has been successfully created with effex!</p>
        <div className='grid gap-4 md:grid-cols-2 lg:grid-cols-3'>
          <Card
            description='The React Framework for the Web'
            href='https://nextjs.org/docs'
            title='Next.js'
          />
          <Card
            description='Next-generation ORM for Node.js & TypeScript'
            href='https://www.prisma.io/docs'
            title='Prisma'
          />
          <Card
            description='The best way to build robust apps in TypeScript'
            href='https://effect.website'
            title='Effect-TS'
          />
          <Card
            description='Incremental bundler and build system'
            href='https://turbo.build/repo/docs'
            title='Turbo'
          />
          <Card description='Fast formatter and linter' href='https://biomejs.dev' title='Biome' />
          <Card
            description='Strict code quality rules'
            href='https://www.npmjs.com/package/ultracite'
            title='Ultracite'
          />
        </div>
      </div>
    </main>
  )
}

function Card({ title, description, href }: { title: string; description: string; href: string }) {
  return (
    <a
      className='group rounded-lg border border-transparent px-5 py-4 transition-colors hover:border-gray-300 hover:bg-gray-100'
      href={href}
      rel='noopener noreferrer'
      target='_blank'
    >
      <h2 className='mb-3 font-semibold text-2xl'>
        {title}{' '}
        <span className='inline-block transition-transform group-hover:translate-x-1 motion-reduce:transform-none'>
          →
        </span>
      </h2>
      <p className='m-0 max-w-[30ch] text-sm opacity-50'>{description}</p>
    </a>
  )
}
