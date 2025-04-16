"use client"
import { X } from "lucide-react"
import { useToast } from "@/hooks/use-toast"

export function Toasts() {
  const { toasts, dismiss } = useToast()

  return (
    <div className="fixed bottom-0 right-0 z-50 p-4 space-y-2 max-w-xs w-full">
      {toasts.map((toast) => (
        <div
          key={toast.id}
          className={`p-4 rounded-md shadow-lg border transition-all transform translate-y-0 opacity-100 ${
            toast.variant === "destructive"
              ? "bg-red-50 border-red-200 dark:bg-red-900/50 dark:border-red-800"
              : toast.variant === "success"
                ? "bg-green-50 border-green-200 dark:bg-green-900/50 dark:border-green-800"
                : "bg-white border-gray-200 dark:bg-finance-900 dark:border-finance-800"
          }`}
        >
          <div className="flex justify-between items-start">
            <div>
              <h3
                className={`font-medium ${
                  toast.variant === "destructive"
                    ? "text-red-800 dark:text-red-200"
                    : toast.variant === "success"
                      ? "text-green-800 dark:text-green-200"
                      : "text-gray-900 dark:text-white"
                }`}
              >
                {toast.title}
              </h3>
              {toast.description && (
                <p
                  className={`text-sm mt-1 ${
                    toast.variant === "destructive"
                      ? "text-red-700 dark:text-red-300"
                      : toast.variant === "success"
                        ? "text-green-700 dark:text-green-300"
                        : "text-gray-600 dark:text-lilac-300"
                  }`}
                >
                  {toast.description}
                </p>
              )}
            </div>
            <button
              onClick={() => dismiss(toast.id)}
              className={`ml-4 p-1 rounded-full ${
                toast.variant === "destructive"
                  ? "text-red-600 hover:bg-red-100 dark:text-red-300 dark:hover:bg-red-800"
                  : toast.variant === "success"
                    ? "text-green-600 hover:bg-green-100 dark:text-green-300 dark:hover:bg-green-800"
                    : "text-gray-500 hover:bg-gray-100 dark:text-lilac-400 dark:hover:bg-finance-800"
              }`}
            >
              <X className="h-4 w-4" />
            </button>
          </div>
        </div>
      ))}
    </div>
  )
}
