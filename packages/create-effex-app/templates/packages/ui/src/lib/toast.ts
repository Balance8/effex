/**
 * Toast notifications using Sonner
 *
 * Usage:
 * ```tsx
 * import { toast } from '@workspace/ui/toast'
 *
 * toast.success('Success!', { description: 'Operation completed' })
 * toast.error('Error!', { description: 'Something went wrong' })
 * toast.info('Info!', { description: 'Information message' })
 * toast('Basic message')
 * ```
 */
// biome-ignore lint/performance/noBarrelFile: Required for toast API re-export
export { toast } from 'sonner'
