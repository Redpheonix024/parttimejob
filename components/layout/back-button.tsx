import Link from "next/link"
import { ArrowLeft } from "lucide-react"

interface BackButtonProps {
  href: string
  label?: string
}

export default function BackButton({ href, label = "Back" }: BackButtonProps) {
  return (
    <Link href={href} className="inline-flex items-center text-sm text-muted-foreground hover:text-foreground mb-6">
      <ArrowLeft className="mr-2 h-4 w-4" />
      {label}
    </Link>
  )
}

