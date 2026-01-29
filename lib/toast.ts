import { toast } from "sonner"

// Duration conventions from CONTEXT.md:
// - success: 3 seconds (quick feedback)
// - error: 7 seconds (more time to read)

export function showSuccess(message: string) {
  toast.success(message, { duration: 3000 })
}

export function showError(message: string) {
  toast.error(message, { duration: 7000 })
}
