import pc from 'picocolors'

export const showBanner = () => {
  const banner = `
${pc.bold(pc.cyan('  ______     ______   ______   ______     __  __    '))}
${pc.bold(pc.cyan(' /\\  ___\\   /\\  ___\\ /\\  ___\\ /\\  ___\\   /\\_\\_\\_\\   '))}
${pc.bold(pc.magenta(' \\ \\  __\\   \\ \\  __\\ \\ \\  __\\ \\ \\  __\\   \\/_/\\_\\/_  '))}
${pc.bold(pc.magenta('  \\ \\_____\\  \\ \\_\\    \\ \\_\\    \\ \\_____\\   /\\_\\/\\_\\ '))}
${pc.bold(pc.magenta('   \\/_____/   \\/_/     \\/_/     \\/_____/   \\/_/\\/_/ '))}

${pc.dim('   ⚡ Scaffold modern full-stack apps with Effect-TS')}
${pc.dim('   🚀 Next.js • Prisma • Biome • Turbo • Effect')}
${pc.dim('   ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━')}
`
  console.log(banner)
}

export const showSuccess = (projectName: string, packageManager: string, skipInstall: boolean) => {
  const installStep = skipInstall
    ? `${pc.cyan('2.')} ${pc.bold(`${packageManager} install`)}\n  ${pc.cyan('3.')} ${pc.bold(`${packageManager} run db:generate`)}\n  ${pc.cyan('4.')} ${pc.bold(`${packageManager} run dev`)}`
    : `${pc.cyan('2.')} ${pc.bold(`${packageManager} run dev`)}`

  const message = `
${pc.green('╔═══════════════════════════════════════════════════════════╗')}
${pc.green('║')}                                                           ${pc.green('║')}
${pc.green('║')}   ${pc.bold('🎉  SUCCESS!')}  Your project is ready to go!          ${pc.green('║')}
${pc.green('║')}                                                           ${pc.green('║')}
${pc.green('╚═══════════════════════════════════════════════════════════╝')}

${pc.bold('Next steps:')}

  ${pc.cyan('1.')} ${pc.bold(`cd ${projectName}`)}
  ${installStep}

${pc.dim('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━')}

${pc.bold('Available commands:')}

  ${pc.cyan(`${packageManager} run dev`)}        ${pc.dim('Start development server')}
  ${pc.cyan(`${packageManager} run build`)}      ${pc.dim('Build for production')}
  ${pc.cyan(`${packageManager} run db:generate`)} ${pc.dim('Generate Drizzle & Effect schemas')}
  ${pc.cyan(`${packageManager} run db:migrate`)}  ${pc.dim('Run database migrations')}
  ${pc.cyan(`${packageManager} run db:studio`)}   ${pc.dim('Open Prisma Studio')}

${pc.dim('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━')}

${pc.bold('Documentation:')}

  ${pc.cyan('Effect-TS:')}  ${pc.underline('https://effect.website')}
  ${pc.cyan('Next.js:')}    ${pc.underline('https://nextjs.org/docs')}
  ${pc.cyan('Prisma:')}     ${pc.underline('https://prisma.io/docs')}
  ${pc.cyan('Turbo:')}      ${pc.underline('https://turbo.build/repo/docs')}

${pc.dim('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━')}

${pc.bold(pc.magenta('Happy coding! ✨'))}
`
  console.log(message)
}
