import { forwardRef } from 'react'
import { Slot } from '@radix-ui/react-slot'
import { cva } from 'class-variance-authority'
import { cn } from '@/lib/utils'

const buttonVariants = cva(
  'inline-flex items-center justify-center gap-2 rounded-xl font-semibold transition-all duration-200 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#5340c8] disabled:pointer-events-none disabled:opacity-50 cursor-pointer',
  {
    variants: {
      variant: {
        default: 'bg-[#5340c8] text-white hover:bg-[#6a55d6] active:scale-95 shadow-lg shadow-[#5340c8]/30',
        secondary: 'bg-[#16213e] text-white border border-[#5340c8]/40 hover:border-[#5340c8] hover:bg-[#5340c8]/10',
        ghost: 'text-white/70 hover:text-white hover:bg-white/10',
        destructive: 'bg-red-600 text-white hover:bg-red-500',
        outline: 'border border-white/20 text-white hover:bg-white/10',
      },
      size: {
        default: 'h-11 px-6 py-2 text-sm',
        sm: 'h-9 px-4 text-sm',
        lg: 'h-14 px-8 text-base',
        icon: 'h-11 w-11',
      },
    },
    defaultVariants: {
      variant: 'default',
      size: 'default',
    },
  }
)

const Button = forwardRef(({ className, variant, size, asChild = false, ...props }, ref) => {
  const Comp = asChild ? Slot : 'button'
  return <Comp className={cn(buttonVariants({ variant, size, className }))} ref={ref} {...props} />
})
Button.displayName = 'Button'

export { Button, buttonVariants }
