'use client'

import { Check, ClipboardList, User, Package, CreditCard, PartyPopper } from 'lucide-react'
import { cn } from '@/lib/utils'

/* ─── Step config ─────────────────────────────────────────────────────────── */
export const BOOKING_STEPS = [
  { id: 1, label: 'Review',           icon: ClipboardList },
  { id: 2, label: 'Traveler Details', icon: User          },
  { id: 3, label: 'Add-ons',          icon: Package       },
  { id: 4, label: 'Payment',          icon: CreditCard    },
  { id: 5, label: 'Confirmation',     icon: PartyPopper   },
] as const

export type StepId = (typeof BOOKING_STEPS)[number]['id']

interface BookingStepsProps {
  currentStep: StepId
  /** Allow clicking a completed step to go back */
  onStepClick?: (step: StepId) => void
}

export default function BookingSteps({ currentStep, onStepClick }: BookingStepsProps) {
  return (
    <div className="w-full">
      {/* Desktop — horizontal stepper */}
      <div className="hidden sm:flex items-center justify-between relative">
        {/* Connecting line */}
        <div className="absolute top-5 left-0 right-0 h-px bg-slate-200 z-0" />
        {/* Progress line */}
        <div
          className="absolute top-5 left-0 h-px z-0 transition-all duration-500"
          style={{
            background: '#00B4D8',
            width: `${((currentStep - 1) / (BOOKING_STEPS.length - 1)) * 100}%`,
          }}
        />

        {BOOKING_STEPS.map((step) => {
          const isCompleted = step.id < currentStep
          const isCurrent = step.id === currentStep
          const Icon = step.icon

          return (
            <button
              key={step.id}
              type="button"
              disabled={!isCompleted && !isCurrent}
              onClick={() => isCompleted && onStepClick?.(step.id)}
              className={cn(
                'relative z-10 flex flex-col items-center gap-2 group',
                isCompleted ? 'cursor-pointer' : isCurrent ? 'cursor-default' : 'cursor-not-allowed opacity-50'
              )}
              aria-current={isCurrent ? 'step' : undefined}
            >
              {/* Circle */}
              <div
                className={cn(
                  'w-10 h-10 rounded-full flex items-center justify-center border-2 transition-all duration-300',
                  isCompleted
                    ? 'border-teal text-white shadow-md'
                    : isCurrent
                      ? 'border-teal text-teal bg-white shadow-lg scale-110'
                      : 'border-slate-200 bg-white text-slate-300'
                )}
                style={{
                  borderColor: isCompleted || isCurrent ? '#00B4D8' : undefined,
                  background: isCompleted ? '#00B4D8' : undefined,
                  color: isCompleted ? '#ffffff' : isCurrent ? '#00B4D8' : undefined,
                }}
              >
                {isCompleted ? (
                  <Check className="h-4 w-4" strokeWidth={3} />
                ) : (
                  <Icon className="h-4 w-4" />
                )}
              </div>

              {/* Label */}
              <span
                className={cn(
                  'text-xs font-semibold whitespace-nowrap transition-colors',
                  isCurrent ? 'text-navy' : isCompleted ? 'text-teal' : 'text-slate-400'
                )}
                style={{ color: isCurrent ? '#0A1628' : isCompleted ? '#00B4D8' : undefined }}
              >
                {step.label}
              </span>
            </button>
          )
        })}
      </div>

      {/* Mobile — compact bar */}
      <div className="flex sm:hidden items-center gap-3">
        {BOOKING_STEPS.map((step) => {
          const isCompleted = step.id < currentStep
          const isCurrent = step.id === currentStep
          const Icon = step.icon

          return (
            <div key={step.id} className="flex-1 flex flex-col items-center gap-1">
              <div
                className={cn(
                  'w-8 h-8 rounded-full flex items-center justify-center transition-all',
                  isCompleted
                    ? 'text-white'
                    : isCurrent
                      ? 'text-white shadow'
                      : 'text-slate-300 bg-slate-100'
                )}
                style={{
                  background: isCompleted ? '#00B4D8' : isCurrent ? '#0A1628' : undefined,
                }}
              >
                {isCompleted ? <Check className="h-3.5 w-3.5" strokeWidth={3} /> : <Icon className="h-3.5 w-3.5" />}
              </div>
              {isCurrent && (
                <span className="text-[10px] font-bold text-navy text-center leading-tight">{step.label}</span>
              )}
            </div>
          )
        })}
      </div>

      {/* Mobile progress bar */}
      <div className="flex sm:hidden mt-2 h-1 bg-slate-100 rounded-full overflow-hidden">
        <div
          className="h-full rounded-full transition-all duration-500"
          style={{
            background: '#00B4D8',
            width: `${((currentStep - 1) / (BOOKING_STEPS.length - 1)) * 100}%`,
          }}
        />
      </div>
    </div>
  )
}
