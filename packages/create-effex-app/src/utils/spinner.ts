import pc from 'picocolors'

const spinnerFrames = ['⠋', '⠙', '⠹', '⠸', '⠼', '⠴', '⠦', '⠧', '⠇', '⠏']
const _SPINNER_INTERVAL_MS = 80

export class Spinner {
  private interval: NodeJS.Timeout | null = null
  private currentFrame = 0
  private text: string

  constructor(text: string) {
    this.text = text
  }

  start() {
    this.interval = setInterval(() => {
      const frame = spinnerFrames[this.currentFrame]
      process.stdout.write(`\r${pc.cyan(frame)} ${pc.gray(this.text)}`)
      this.currentFrame = (this.currentFrame + 1) % spinnerFrames.length
    }, _SPINNER_INTERVAL_MS)
  }

  succeed(message?: string) {
    this.stop()
    console.log(`${pc.green('✓')} ${pc.gray(message || this.text)}`)
  }

  fail(message?: string) {
    this.stop()
    console.log(`${pc.red('✗')} ${pc.gray(message || this.text)}`)
  }

  stop() {
    if (this.interval) {
      clearInterval(this.interval)
      this.interval = null
      process.stdout.write('\r\x1b[K')
    }
  }

  updateText(text: string) {
    this.text = text
  }
}

export const withSpinner = async <T>(text: string, fn: () => Promise<T>): Promise<T> => {
  const spinner = new Spinner(text)
  spinner.start()
  try {
    const result = await fn()
    spinner.succeed()
    return result
  } catch (error) {
    spinner.fail()
    throw error
  }
}
