// Add this useEffect to debug step changes
useEffect(() => {
  console.log(`🔵 Step changed to: ${step}`);
  
  // Auto-advance for debugging if stuck
  if (step === 'processingPayment') {
    const timer = setTimeout(() => {
      console.log('🟡 Auto-advancing from processingPayment to otp');
      setStep('otp');
    }, 4000);
    return () => clearTimeout(timer);
  }
  
  if (step === 'otp') {
    const timer = setTimeout(() => {
      console.log('🟡 Auto-advancing from otp to review');
      setStep('review');
    }, 5000);
    return () => clearTimeout(timer);
  }
}, [step]);
