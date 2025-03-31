import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { Badge } from "@/components/ui/badge"

interface MessageCardProps {
  message: {
    sender: string
    subject: string
    preview: string
    time: string
    unread: boolean
  }
}

export default function MessageCard({ message }: MessageCardProps) {
  return (
    <div className={`flex items-start p-3 rounded-md ${message.unread ? "bg-muted" : ""}`}>
      <Avatar className="h-10 w-10">
        <AvatarImage src="/placeholder.svg?height=40&width=40" alt={message.sender} />
        <AvatarFallback>{message.sender.charAt(0)}</AvatarFallback>
      </Avatar>
      <div className="ml-4 flex-1">
        <div className="flex items-center justify-between">
          <h3 className="font-medium">{message.sender}</h3>
          <span className="text-xs text-muted-foreground">{message.time}</span>
        </div>
        <p className="text-sm text-muted-foreground">{message.subject}</p>
        <p className="text-sm mt-1">{message.preview}</p>
      </div>
      {message.unread && <Badge className="ml-2 bg-primary">New</Badge>}
    </div>
  )
}

