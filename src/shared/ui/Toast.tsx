'use client'

/**
 * Système de notifications toast réactives et accessibles (Shared UI).
 *
 * Apporte du dynamisme à l'application en fournissant un retour visuel
 * immédiat sur les opérations (exports, sauvegardes, imports, calculs).
 */

import React, { createContext, useContext, useState, useCallback, ReactNode } from 'react'
import { CheckCircle2, AlertCircle, Info, X } from 'lucide-react'

export type ToastTone = 'success' | 'alert' | 'info'

export interface ToastMessage {
  id: string
  title?: string
  message: string
  tone?: ToastTone
  duration?: number
}

interface ToastContextType {
  toast: (message: string, options?: { title?: string; tone?: ToastTone; duration?: number }) => void
  success: (message: string, title?: string) => void
  error: (message: string, title?: string) => void
  info: (message: string, title?: string) => void
}

const ToastContext = createContext<ToastContextType | null>(null)

export function ToastProvider({ children }: { children: ReactNode }) {
  const [toasts, setToasts] = useState<ToastMessage[]>([])

  const removeToast = useCallback((id: string) => {
    setToasts(prev => prev.filter(t => t.id !== id))
  }, [])

  const addToast = useCallback((message: string, options?: { title?: string; tone?: ToastTone; duration?: number }) => {
    const id = `toast-${Date.now()}-${Math.random().toString(36).slice(2, 6)}`
    const duration = options?.duration ?? 4000
    const tone = options?.tone ?? 'info'
    const title = options?.title

    setToasts(prev => [...prev, { id, message, tone, title, duration }])

    if (duration > 0) {
      setTimeout(() => {
        removeToast(id)
      }, duration)
    }
  }, [removeToast])

  const success = useCallback((message: string, title?: string) => {
    addToast(message, { title: title ?? 'Succès', tone: 'success' })
  }, [addToast])

  const error = useCallback((message: string, title?: string) => {
    addToast(message, { title: title ?? 'Attention', tone: 'alert', duration: 6000 })
  }, [addToast])

  const info = useCallback((message: string, title?: string) => {
    addToast(message, { title, tone: 'info' })
  }, [addToast])

  return (
    <ToastContext.Provider value={{ toast: addToast, success, error, info }}>
      {children}
      {/* Conteneur flottant des toasts */}
      <div
        className="fixed bottom-5 right-5 z-50 flex flex-col gap-2 max-w-sm w-full pointer-events-none no-print"
        aria-live="polite"
        aria-atomic="true"
      >
        {toasts.map(t => (
          <div
            key={t.id}
            className={`pointer-events-auto flex items-start gap-3 p-3.5 rounded shadow-lg border text-sm transition-all animate-in fade-in slide-in-from-bottom-2 duration-200 ${
              t.tone === 'success'
                ? 'bg-[#e8f5ee] border-[#b6ddc7] text-[#1f6b4a]'
                : t.tone === 'alert'
                ? 'bg-[#fdefef] border-[#e8b9b9] text-[#9c3b3b]'
                : 'bg-[#e2f2f2] border-[#b4dada] text-[#01595c]'
            }`}
          >
            <div className="flex-none mt-0.5">
              {t.tone === 'success' && <CheckCircle2 size={16} />}
              {t.tone === 'alert' && <AlertCircle size={16} />}
              {t.tone === 'info' && <Info size={16} />}
            </div>
            <div className="flex-1 min-w-0">
              {t.title && <div className="font-semibold text-xs uppercase tracking-wide mb-0.5">{t.title}</div>}
              <div className="leading-snug">{t.message}</div>
            </div>
            <button
              type="button"
              onClick={() => removeToast(t.id)}
              className="flex-none p-1 rounded opacity-70 hover:opacity-100 transition-opacity"
              aria-label="Fermer la notification"
            >
              <X size={14} />
            </button>
          </div>
        ))}
      </div>
    </ToastContext.Provider>
  )
}

export function useToast(): ToastContextType {
  const ctx = useContext(ToastContext)
  if (!ctx) {
    // Repli sécurisé hors provider
    return {
      toast: () => {},
      success: () => {},
      error: () => {},
      info: () => {},
    }
  }
  return ctx
}
