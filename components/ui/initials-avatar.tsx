import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar'
import { Text } from '@/components/ui/text'
import { cn } from '@/lib/utils'

// Tints are theme tokens: neutral in light/dark, colored in the redesign theme
const TINTS = [
  { bg: 'bg-tint-1', fg: 'text-tint-1-foreground' },
  { bg: 'bg-tint-2', fg: 'text-tint-2-foreground' },
  { bg: 'bg-tint-3', fg: 'text-tint-3-foreground' },
  { bg: 'bg-tint-4', fg: 'text-tint-4-foreground' },
  { bg: 'bg-tint-5', fg: 'text-tint-5-foreground' },
] as const

export function getInitials(name: string) {
  const words = name.trim().split(/\s+/).filter(Boolean)
  if (!words.length) return '?'
  if (words.length === 1) return words[0].slice(0, 2).toUpperCase()
  return (words[0][0] + words[1][0]).toUpperCase()
}

// Same name always gets the same tint
export function getTint(name: string) {
  let hash = 0
  for (let i = 0; i < name.length; i++) hash = (hash * 31 + name.charCodeAt(i)) | 0
  return TINTS[Math.abs(hash) % TINTS.length]
}

function InitialsAvatar({
  name,
  uri,
  className,
  textClassName,
}: {
  name: string
  uri?: string | null
  className?: string
  textClassName?: string
}) {
  const tint = getTint(name)
  return (
    <Avatar alt={name} className={cn('size-10', className)}>
      {uri ? <AvatarImage source={{ uri }} /> : null}
      <AvatarFallback className={tint.bg}>
        <Text className={cn('text-sm font-semibold', tint.fg, textClassName)}>
          {getInitials(name)}
        </Text>
      </AvatarFallback>
    </Avatar>
  )
}

export { InitialsAvatar }
