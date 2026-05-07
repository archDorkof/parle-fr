import { cn } from '@/lib/utils'

function Badge({ className, variant = 'default', ...props }) {
  const variants = {
    default: 'bg-[#5340c8]/20 text-[#a090f0] border border-[#5340c8]/30',
    success: 'bg-green-500/20 text-green-400 border border-green-500/30',
    warning: 'bg-yellow-500/20 text-yellow-400 border border-yellow-500/30',
    error: 'bg-red-500/20 text-red-400 border border-red-500/30',
  }
  return (
    <span
      className={cn(
        'inline-flex items-center rounded-full px-2.5 py-0.5 text-xs font-semibold',
        variants[variant],
        className
      )}
      {...props}
    />
  )
}

export { Badge }
