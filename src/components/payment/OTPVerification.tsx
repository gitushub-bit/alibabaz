import { useState, useRef, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Shield, RefreshCw } from 'lucide-react';
import { Progress } from '@/components/ui/progress';

interface OTPVerificationProps {
  onVerified: () => void; // 👉 move to OTP processing screen
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
  const [otp, setOtp] = useState<string[]>(Array(codeLength).fill(''));
  const [error, setError] = useState('');
  const [resendTimer, setResendTimer] = useState(30);
  const [attempt, setAttempt] = useState(0);
  const [resendLocked, setResendLocked] = useState(false);

  const inputRefs = useRef<(HTMLInputElement | null)[]>([]);

  /* -------------------- TIMER -------------------- */
  useEffect(() => {
    if (resendTimer <= 0) return;
    const timer = setTimeout(() => setResendTimer(t => t - 1), 1000);
    return () => clearTimeout(timer);
  }, [resendTimer]);

  const progressPercentage = (resendTimer / 30) * 100;

  /* -------------------- INPUT HANDLERS -------------------- */
  const handleChange = (index: number, value: string) => {
    if (!/^\d*$/.test(value)) return;

    const next = [...otp];
    next[index] = value.slice(-1);
    setOtp(next);
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
    const pasted = e.clipboardData
      .getData('text')
      .replace(/\D/g, '')
      .slice(0, codeLength);

    const next = [...otp];
    pasted.split('').forEach((c, i) => (next[i] = c));
    setOtp(next);
    setError('');
  };

  /* -------------------- VERIFY -------------------- */
  const handleVerify = () => {
    const code = otp.join('');

    if (code.length !== codeLength) {
      setError('Please enter all digits');
      return;
    }

    onOTPSubmit?.(code);

    const nextAttempt = attempt + 1;
    setAttempt(nextAttempt);

    // ❌ First attempt fails (demo / sandbox behavior)
    if (nextAttempt === 1) {
      setError('Invalid OTP. Please try again.');
      return;
    }

    // ✅ Second attempt succeeds → move to OTP processing
    onVerified();
  };

  /* -------------------- RESEND -------------------- */
  const handleResend = () => {
    if (resendLocked) return;

    setOtp(Array(codeLength).fill(''));
    setError('');
    setResendTimer(30);
    setResendLocked(true);

    onResend();

    setTimeout(() => setResendLocked(false), 1000);
  };

  /* -------------------- UI -------------------- */
  return (
    <Card className="w-full max-w-md mx-auto">
      <CardHeader className="text-center">
        <div className="mx-auto mb-4 flex h-12 w-12 items-center justify-center rounded-full bg-primary/10">
          <Shield className="h-6 w-6 text-primary" />
        </div>
        <CardTitle>OTP Verification</CardTitle>
        <CardDescription>
          Enter the one-time code sent to your phone
        </CardDescription>
      </CardHeader>

      <CardContent className="space-y-6">
        {/* Timer */}
        <div className="space-y-2">
          <div className="flex justify-between text-sm">
            <span className="text-muted-foreground">Resend available in</span>
            <span className="font-medium">{resendTimer}s</span>
          </div>
          <Progress value={progressPercentage} />
        </div>

        {/* OTP Inputs */}
        <div className="flex justify-center gap-2" onPaste={handlePaste}>
          {otp.map((digit, index) => (
            <Input
              key={index}
              ref={el => (inputRefs.current[index] = el)}
              value={digit}
              type="text"
              inputMode="numeric"
              maxLength={1}
              onChange={e => handleChange(index, e.target.value)}
              onKeyDown={e => handleKeyDown(index, e)}
              className="h-14 w-12 text-center text-xl font-bold"
            />
          ))}
        </div>

        {error && (
          <p className="text-center text-sm text-destructive">{error}</p>
        )}

        {/* Resend */}
        <div className="text-center text-sm text-muted-foreground">
          {resendTimer > 0 ? (
            <p>
              Resend code in <span className="font-medium">{resendTimer}s</span>
            </p>
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

        {/* Submit */}
        <Button
          className="w-full"
          onClick={handleVerify}
          disabled={processing || otp.some(d => !d)}
        >
          {processing ? 'Verifying…' : 'Verify & Continue'}
        </Button>
      </CardContent>
    </Card>
  );
}
