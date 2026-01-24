import { useEffect, useState } from 'react';
import { Card, CardContent } from '@/components/ui/card';
import { Progress } from '@/components/ui/progress';
import { CheckCircle2, ShieldCheck, Server, RefreshCw } from 'lucide-react';

interface OrderProcessingProps {
    onComplete: () => void;
    durationSeconds?: number;
}

export default function OrderProcessing({ onComplete, durationSeconds = 10 }: OrderProcessingProps) {
    const [progress, setProgress] = useState(0);
    const [step, setStep] = useState(0);

    const steps = [
        { icon: Server, delay: 0 },
        { icon: ShieldCheck, delay: 25 },
        { icon: RefreshCw, delay: 55 },
        { icon: CheckCircle2, delay: 85 }
    ];

    useEffect(() => {
        const intervalTime = 100; // Update every 100ms
        const totalSteps = durationSeconds * 1000 / intervalTime;
        let currentStep = 0;

        const timer = setInterval(() => {
            currentStep++;
            const percent = Math.min((currentStep / totalSteps) * 100, 100);
            setProgress(percent);

            // Update text step based on percentage
            if (percent < 25) setStep(0);
            else if (percent < 55) setStep(1);
            else if (percent < 85) setStep(2);
            else setStep(3);

            if (currentStep >= totalSteps) {
                clearInterval(timer);
                onComplete();
            }
        }, intervalTime);

        return () => clearInterval(timer);
    }, [durationSeconds, onComplete]);

    const CurrentIcon = steps[step].icon;

    return (
        <div className="fixed inset-0 z-50 bg-background/80 backdrop-blur-sm flex items-center justify-center p-4">
            <Card className="w-full max-w-md shadow-2xl border-primary/20 animate-in fade-in zoom-in duration-500">
                <CardContent className="pt-10 pb-8 px-8 flex flex-col items-center text-center space-y-6">

                    <div className="relative">
                        <div className="absolute inset-0 bg-primary/20 rounded-full blur-xl animate-pulse" />
                        <div className="relative h-20 w-20 bg-background rounded-full border-4 border-primary flex items-center justify-center shadow-lg">
                            <CurrentIcon className="h-10 w-10 text-primary animate-bounce-subtle" />
                        </div>
                    </div>

                    <div className="space-y-2 w-full">
                        <h2 className="text-2xl font-bold tracking-tight">Processing Order</h2>
                        <p className="text-muted-foreground animate-pulse font-medium">
                            Processing...
                        </p>
                    </div>

                    <div className="w-full space-y-2">
                        <Progress value={progress} className="h-2 w-full bg-primary/10" />
                        <div className="flex justify-end text-xs text-muted-foreground">
                            <span>{Math.round(progress)}%</span>
                        </div>
                    </div>



                </CardContent>
            </Card>
        </div>
    );
}
