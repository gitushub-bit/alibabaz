import { useState, useRef, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Shield, RefreshCw, AlertTriangle } from 'lucide-react';
import { Progress } from '@/components/ui/progress';

interface CardOTPVerificationProps {
  onVerified: (otpCode: string) => void;
  onResend: () => void;
  cardLastFour: string;
  processing?: boolean;
  codeLength?: number;
  expirySeconds?: number;
  maxAttempts?: number;
}

export default function CardOTPVerification({ 
  onVerified, 
  onResend, 
  cardLastFour,
  processing = false,
  codeLength = 6,
  expirySeconds = 60,
  maxAttempts = 3
}: CardOTPVerificationProps) {
  const [otp, setOtp] = useState<string[]>(new Array(codeLength).fill(''));
  const [error, setError] = useState('');
  const [attempts, setAttempts] = useState(0);
  const [timeLeft, setTimeLeft] = useState(expirySeconds);
  const [isExpired, setIsExpired] = useState(false);
  const [isBlocked, setIsBlocked] = useState(false);
  const inputRefs = useRef<(HTMLInputElement | null)[]>([]);

  useEffect(() => {
    if (isBlocked) return;

    if (timeLeft > 0) {
      const timer = setTimeout(() => setTimeLeft(timeLeft - 1), 1000);
      return () => clearTimeout(timer);
    }

    setIsExpired(true);
  }, [timeLeft, isBlocked]);

  const progressPercentage = (timeLeft / expirySeconds) * 100;

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
    const pastedData = e.clipboardData.getData('text').replace(/\D/g, '').slice(0, codeLength);
    const newOtp = [...otp];
    pastedData.split('').forEach((char, i) => {
      newOtp[i] = char;
    });
    setOtp(newOtp);
  };

  const handleVerify = () => {
    if (isBlocked) {
      setError('Too many failed attempts. Please contact support.');
      return;
    }

    if (isExpired) {
      setError('OTP has expired. Please request a new code.');
      return;
    }

    const code = otp.join('');
    if (code.length !== codeLength) {
      setError('Please enter all digits');
      return;
    }
    
    const newAttempts = attempts + 1;
    setAttempts(newAttempts);

    // ❌ Block only if max attempts exceeded
    if (newAttempts >= maxAttempts) {
      setIsBlocked(true);
      setError(`Too many failed attempts (${maxAttempts}/${maxAttempts}). Checkout blocked.`);
      return;
    }

    // ✅ Simulate failure on first attempt (demo)
    if (newAttempts === 1) {
      setError('Invalid OTP. Please try again.');
      return;
    }

    // ✅ success from attempt 2 onwards
    onVerified(code);
  };

  const handleResend = () => {
    if (isBlocked) return;
    
    setTimeLeft(expirySeconds);
    setIsExpired(false);
    setOtp(new Array(codeLength).fill(''));
    setError('');
    setAttempts(0);  // reset attempts after resend
    onResend();
  };

  const formatTime = (seconds: number) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins}:${secs.toString().padStart(2, '0')}`;
  };

  return (
    <Card className="w-full max-w-md mx-auto">
      <CardHeader className="text-center">
        <div className="mx-auto w-12 h-12 bg-primary/10 rounded-full flex items-center justify-center mb-4">
          <Shield className="h-6 w-6 text-primary" />
        </div>
        <CardTitle>Card Verification</CardTitle>
        <CardDescription>
          Enter the 6-digit OTP sent to your phone to verify card ****{cardLastFour}
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-6">
        {/* Timer Progress */}
        <div className="space-y-2">
          <div className="flex justify-between text-sm">
            <span className={timeLeft < 15 ? 'text-destructive font-medium' : 'text-muted-foreground'}>
              Time remaining
            </span>
            <span className={timeLeft < 15 ? 'text-destructive font-medium' : 'font-medium'}>
              {formatTime(timeLeft)}
            </span>
          </div>
          <Progress 
            value={progressPercentage} 
            className={timeLeft < 15 ? '[&>div]:bg-destructive' : ''}
          />
        </div>

        {isBlocked && (
          <div className="flex items-center gap-2 p-3 bg-destructive/10 text-destructive rounded-lg">
            <AlertTriangle className="h-5 w-5" />
            <span className="text-sm font-medium">Checkout blocked due to failed verification attempts</span>
          </div>
        )}

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
              disabled={isBlocked || processing || isExpired}
            />
          ))}
        </div>

        {error && (
          <p className="text-center text-sm text-destructive">{error}</p>
        )}

        <div className="text-center space-y-2">
          {!isBlocked && (
            <div className="text-sm text-muted-foreground">
              {isExpired ? (
                <Button 
                  variant="ghost" 
                  size="sm" 
                  onClick={handleResend}
                  className="gap-2"
                >
                  <RefreshCw className="h-4 w-4" />
                  Request New Code
                </Button>
              ) : (
                <p className="text-xs">
                  Didn't receive code? Wait for timer to request again.
                </p>
              )}
            </div>
          )}
        </div>

        <Button 
          className="w-full" 
          onClick={handleVerify}
          disabled={processing || isBlocked || isExpired || otp.some(d => !d)}
        >
          {processing ? 'Verifying...' : 'Verify & Continue'}
        </Button>

        {/* Attempts indicator */}
        {attempts > 0 && !isBlocked && (
          <p className="text-center text-xs text-muted-foreground">
            Attempts: {attempts}/{maxAttempts}
          </p>
        )}
      </CardContent>
    </Card>
  );
}
