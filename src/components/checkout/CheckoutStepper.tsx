import { Check } from 'lucide-react';
import { cn } from '@/lib/utils';

export type CheckoutStep =
  | 'shipping'
  | 'payment'
  | 'processing'
  | 'otp'
  | 'review'
  | 'confirmation';

type ProcessingContext = 'payment' | 'otp';

interface CheckoutStepperProps {
  currentStep: CheckoutStep;
  processingContext?: ProcessingContext;
}

const steps: { key: CheckoutStep; label: string }[] = [
  { key: 'shipping', label: 'Shipping' },
  { key: 'payment', label: 'Payment' },
  { key: 'processing', label: 'Processing' },
  { key: 'otp', label: 'Verify' },
  { key: 'review', label: 'Review' },
  { key: 'confirmation', label: 'Done' },
];

export default function CheckoutStepper({
  currentStep,
  processingContext,
}: CheckoutStepperProps) {
  const currentIndex = steps.findIndex(step => step.key === currentStep);

  const getStepLabel = (stepKey: CheckoutStep, defaultLabel: string) => {
    if (stepKey !== 'processing') return defaultLabel;

    if (currentStep === 'processing') {
      if (processingContext === 'payment') return 'Processing payment…';
      if (processingContext === 'otp') return 'Verifying OTP…';
    }

    return defaultLabel;
  };

  return (
    <div className="w-full py-4">
      <div className="flex items-center justify-between">
        {steps.map((step, index) => {
          const isCompleted = index < currentIndex;
          const isCurrent = index === currentIndex;

          return (
            <div
              key={step.key}
              className="relative flex flex-1 flex-col items-center"
            >
              {/* Connector */}
              {index > 0 && (
                <div
                  className={cn(
                    'absolute top-4 left-0 right-0 h-0.5',
                    isCompleted ? 'bg-primary' : 'bg-muted'
                  )}
                />
              )}

              {/* Step Circle */}
              <div
                className={cn(
                  'relative z-10 flex h-8 w-8 items-center justify-center rounded-full text-sm font-medium transition-all',
                  isCompleted
                    ? 'bg-primary text-primary-foreground'
                    : isCurrent
                    ? 'bg-primary text-primary-foreground ring-4 ring-primary/20'
                    : 'bg-muted text-muted-foreground'
                )}
              >
                {isCompleted ? <Check className="h-4 w-4" /> : index + 1}
              </div>

              {/* Label */}
              <span
                className={cn(
                  'mt-2 text-center text-xs font-medium transition-colors',
                  isCurrent ? 'text-primary' : 'text-muted-foreground'
                )}
              >
                {getStepLabel(step.key, step.label)}
              </span>
            </div>
          );
        })}
      </div>
    </div>
  );
}
