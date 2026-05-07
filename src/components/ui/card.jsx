import { cn } from '@/lib/utils'

function Card({ className, ...props }) {
  return (
    <div
      className={cn('rounded-2xl border border-white/10 bg-[#16213e] p-6 shadow-xl', className)}
      {...props}
    />
  )
}

function CardHeader({ className, ...props }) {
  return <div className={cn('mb-4 flex flex-col gap-1', className)} {...props} />
}

function CardTitle({ className, ...props }) {
  return <h2 className={cn('text-xl font-bold text-white', className)} {...props} />
}

function CardDescription({ className, ...props }) {
  return <p className={cn('text-sm text-white/50', className)} {...props} />
}

function CardContent({ className, ...props }) {
  return <div className={cn('', className)} {...props} />
}

function CardFooter({ className, ...props }) {
  return <div className={cn('mt-6 flex items-center gap-3', className)} {...props} />
}

export { Card, CardHeader, CardTitle, CardDescription, CardContent, CardFooter }
