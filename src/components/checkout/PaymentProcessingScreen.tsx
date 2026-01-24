import { useEffect, useState } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Progress } from '@/components/ui/progress';
import { Shield, CreditCard, Lock, CheckCircle2 } from 'lucide-react';

interface PaymentProcessingScreenProps {
  cardLastFour: string;
  cardBrand: string;
  duration?: number; // in seconds
  onComplete: () => void;
}

const processingSteps = [
  { icon: CreditCard, text: 'Validating card details...', duration: 5 },
  { icon: Lock, text: 'Encrypting transaction...', duration: 5 },
  { icon: Shield, text: 'Initiating 3D Secure verification...', duration: 5 },
  { icon: CheckCircle2, text: 'Sending OTP to your device...', duration: 5 },
];

export default function PaymentProcessingScreen({
  cardLastFour,
  cardBrand,
  duration = 20,
  onComplete,
}: PaymentProcessingScreenProps) {
  const [progress, setProgress] = useState(0);
  const [currentStep, setCurrentStep] = useState(0);
  const [elapsedTime, setElapsedTime] = useState(0);

  useEffect(() => {
    const interval = setInterval(() => {
      setElapsedTime((prev) => {
        const next = prev + 0.1;
        
        // Calculate progress (0-100)
        const newProgress = Math.min((next / duration) * 100, 100);
        setProgress(newProgress);

        // Calculate current step
        const stepDuration = duration / processingSteps.length;
        const newStep = Math.min(Math.floor(next / stepDuration), processingSteps.length - 1);
        setCurrentStep(newStep);

        // Complete when duration reached
        if (next >= duration) {
          clearInterval(interval);
          setTimeout(onComplete, 500);
        }

        return next;
      });
    }, 100);

    return () => clearInterval(interval);
  }, [duration, onComplete]);

  const CurrentIcon = processingSteps[currentStep]?.icon || Shield;

  return (
    <Card className="w-full max-w-md mx-auto">
      <CardHeader className="text-center">
        <div className="mx-auto w-16 h-16 bg-primary/10 rounded-full flex items-center justify-center mb-4 relative">
          <CurrentIcon className="h-8 w-8 text-primary animate-pulse" />
          {/* Spinning ring */}
          <div className="absolute inset-0 border-4 border-primary/20 rounded-full" />
          <div 
            className="absolute inset-0 border-4 border-transparent border-t-primary rounded-full animate-spin"
            style={{ animationDuration: '1.5s' }}
          />
        </div>
        <CardTitle>Securing Your Payment</CardTitle>
        <CardDescription>
          Verifying {cardBrand} card ending in {cardLastFour}
        </CardDescription>
      </CardHeader>

      <CardContent className="space-y-6">
        {/* Main Progress Bar */}
        <div className="space-y-2">
          <Progress value={progress} className="h-3" />
          <div className="flex justify-between text-xs text-muted-foreground">
            <span>{Math.round(progress)}% complete</span>
            <span>{Math.max(0, Math.ceil(duration - elapsedTime))}s remaining</span>
          </div>
        </div>

        {/* Processing Steps */}
        <div className="space-y-3">
          {processingSteps.map((step, index) => {
            const StepIcon = step.icon;
            const isCompleted = index < currentStep;
            const isActive = index === currentStep;

            return (
              <div
                key={index}
                className={`flex items-center gap-3 p-3 rounded-lg transition-all duration-300 ${
                  isActive
                    ? 'bg-primary/10 border border-primary/30'
                    : isCompleted
                    ? 'bg-muted/50'
                    : 'opacity-50'
                }`}
              >
                <div
                  className={`w-8 h-8 rounded-full flex items-center justify-center ${
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
                    <StepIcon className={`h-4 w-4 ${isActive ? 'animate-pulse' : ''}`} />
                  )}
                </div>
                <span
                  className={`text-sm ${
                    isActive ? 'font-medium text-foreground' : 'text-muted-foreground'
                  }`}
                >
                  {step.text}
                </span>
              </div>
            );
          })}
        </div>

        {/* Security Notice */}
        <div className="flex items-center gap-2 p-3 bg-muted/50 rounded-lg">
          <Lock className="h-4 w-4 text-muted-foreground" />
          <p className="text-xs text-muted-foreground">
            Your payment is protected by bank-level encryption. Do not close this window.
          </p>
        </div>
      </CardContent>
    </Card>
  );
}
