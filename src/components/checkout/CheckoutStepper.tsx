import { Check } from 'lucide-react';
import { cn } from '@/lib/utils';

export type CheckoutStep =
  | 'shipping'
  | 'payment'
  | 'processingPayment'
  | 'otp'
  | 'processingOtp'
  | 'review'
  | 'confirmation';

interface CheckoutStepperProps {
  currentStep: CheckoutStep;
}

const steps: { key: CheckoutStep; label: string }[] = [
  { key: 'shipping', label: 'Shipping' },
  { key: 'payment', label: 'Payment' },
  { key: 'processingPayment', label: 'Processing payment…' },
  { key: 'otp', label: 'Verify' },
  { key: 'processingOtp', label: 'Verifying OTP…' },
  { key: 'review', label: 'Review' },
  { key: 'confirmation', label: 'Done' },
];

export default function CheckoutStepper({ currentStep }: CheckoutStepperProps) {
  const currentIndex = steps.findIndex(step => step.key === currentStep);

  return (
    <div className="w-full py-4">
      <div className="flex items-center justify-between">
        {steps.map((step, index) => {
          const isCompleted = index < currentIndex;
          const isCurrent = index === currentIndex;

          return (
            <div key={step.key} className="relative flex flex-1 flex-col items-center">
              {index > 0 && (
                <div
                  className={cn(
                    'absolute top-4 left-0 right-0 h-0.5',
                    isCompleted ? 'bg-primary' : 'bg-muted'
                  )}
                />
              )}

              <div
                className={cn(
                  'relative z-10 flex h-8 w-8 items-center justify-center rounded-full text-sm font-medium',
                  isCompleted
                    ? 'bg-primary text-primary-foreground'
                    : isCurrent
                    ? 'bg-primary text-primary-foreground ring-4 ring-primary/20'
                    : 'bg-muted text-muted-foreground'
                )}
              >
                {isCompleted ? <Check className="h-4 w-4" /> : index + 1}
              </div>

              <span
                className={cn(
                  'mt-2 text-xs font-medium text-center',
                  isCurrent ? 'text-primary' : 'text-muted-foreground'
                )}
              >
                {step.label}
              </span>
            </div>
          );
        })}
      </div>
    </div>
  );
}
