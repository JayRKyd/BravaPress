import { User } from "lucide-react"

export function UserNav() {
  return (
    <div className="flex items-center space-x-4">
      <div className="flex items-center space-x-2">
        <User className="h-5 w-5" />
        <span>User</span>
      </div>
    </div>
  )
}
