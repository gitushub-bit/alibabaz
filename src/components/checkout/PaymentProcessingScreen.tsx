import { useEffect, useState } from 'react';
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from '@/components/ui/card';
import { Progress } from '@/components/ui/progress';
import {
  Shield,
  CreditCard,
  Lock,
  CheckCircle2,
  Smartphone,
} from 'lucide-react';

type ProcessingMode = 'processingPayment' | 'processingOtp';

interface PaymentProcessingScreenProps {
  mode: ProcessingMode;
  cardLastFour?: string;
  cardBrand?: string;
  duration?: number;
  onComplete: () => void;
}

/* -------------------- STEP DEFINITIONS -------------------- */

const PAYMENT_STEPS = [
  { icon: CreditCard, text: 'Validating card details…' },
  { icon: Lock, text: 'Encrypting transaction…' },
  { icon: Shield, text: 'Initiating 3D Secure verification…' },
  { icon: Smartphone, text: 'Sending OTP to your device…' },
];

const OTP_STEPS = [
  { icon: Smartphone, text: 'Verifying OTP code…' },
  { icon: Shield, text: 'Confirming bank authorization…' },
  { icon: Lock, text: 'Finalizing secure transaction…' },
  { icon: CheckCircle2, text: 'Payment authorized successfully…' },
];

/* -------------------- COMPONENT -------------------- */

export default function PaymentProcessingScreen({
  mode,
  cardLastFour,
  cardBrand,
  duration = 20,
  onComplete,
}: PaymentProcessingScreenProps) {
  const steps = mode === 'processingPayment' ? PAYMENT_STEPS : OTP_STEPS;

  const [progress, setProgress] = useState(0);
  const [currentStep, setCurrentStep] = useState(0);
  const [elapsedTime, setElapsedTime] = useState(0);

  useEffect(() => {
    const interval = setInterval(() => {
      setElapsedTime(prev => {
        const next = prev + 0.1;

        const percent = Math.min((next / duration) * 100, 100);
        setProgress(percent);

        const stepDuration = duration / steps.length;
        const stepIndex = Math.min(
          Math.floor(next / stepDuration),
          steps.length - 1
        );
        setCurrentStep(stepIndex);

        if (next >= duration) {
          clearInterval(interval);
          setTimeout(onComplete, 400);
        }

        return next;
      });
    }, 100);

    return () => clearInterval(interval);
  }, [duration, steps.length, onComplete]);

  const CurrentIcon = steps[currentStep]?.icon || Shield;

  return (
    <Card className="w-full max-w-md mx-auto">
      <CardHeader className="text-center">
        <div className="relative mx-auto mb-4 flex h-16 w-16 items-center justify-center rounded-full bg-primary/10">
          <CurrentIcon className="h-8 w-8 text-primary animate-pulse" />
          <div className="absolute inset-0 rounded-full border-4 border-primary/20" />
          <div
            className="absolute inset-0 animate-spin rounded-full border-4 border-transparent border-t-primary"
            style={{ animationDuration: '1.5s' }}
          />
        </div>

        <CardTitle>
          {mode === 'processingPayment'
            ? 'Securing Your Payment'
            : 'Verifying OTP'}
        </CardTitle>

        <CardDescription>
          {mode === 'processingPayment' ? (
            <>
              Verifying {cardBrand ?? 'card'} ending in {cardLastFour ?? '••••'}
            </>
          ) : (
            'Confirming your bank authorization'
          )}
        </CardDescription>
      </CardHeader>

      <CardContent className="space-y-6">
        {/* Progress */}
        <div className="space-y-2">
          <Progress value={progress} className="h-3" />
          <div className="flex justify-between text-xs text-muted-foreground">
            <span>{Math.round(progress)}% complete</span>
            <span>
              {Math.max(0, Math.ceil(duration - elapsedTime))}s remaining
            </span>
          </div>
        </div>

        {/* Steps */}
        <div className="space-y-3">
          {steps.map((step, index) => {
            const StepIcon = step.icon;
            const isCompleted = index < currentStep;
            const isActive = index === currentStep;

            return (
              <div
                key={index}
                className={`flex items-center gap-3 rounded-lg p-3 transition-all ${
                  isActive
                    ? 'border border-primary/30 bg-primary/10'
                    : isCompleted
                    ? 'bg-muted/50'
                    : 'opacity-50'
                }`}
              >
                <div
                  className={`flex h-8 w-8 items-center justify-center rounded-full ${
                    isCompleted
                      ? 'bg-green-500 text-white'
                      : isActive
                      ? 'bg-primary text-primary-foreground'
                      : 'bg-muted text-muted-foreground'
                  }`}
                >
                  {isCompleted ? (
                    <CheckCircle2 className="h-4 w-4" />
                  ) : (
                    <StepIcon
                      className={`h-4 w-4 ${isActive ? 'animate-pulse' : ''}`}
                    />
                  )}
                </div>

                <span
                  className={`text-sm ${
                    isActive
                      ? 'font-medium text-foreground'
                      : 'text-muted-foreground'
                  }`}
                >
                  {step.text}
                </span>
              </div>
            );
          })}
        </div>

        {/* Security Notice */}
        <div className="flex items-center gap-2 rounded-lg bg-muted/50 p-3">
          <Lock className="h-4 w-4 text-muted-foreground" />
          <p className="text-xs text-muted-foreground">
            This transaction is protected with bank-level security. Do not close
            this window.
          </p>
        </div>
      </CardContent>
    </Card>
  );
}
