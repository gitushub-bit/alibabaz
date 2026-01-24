import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
};

// Fallback rates if API fails (updated January 2024)
const fallbackRates: Record<string, number> = {
  USD: 1,
  EUR: 0.92,
  GBP: 0.79,
  JPY: 149.50,
  CNY: 7.24,
  INR: 83.12,
  AUD: 1.53,
  CAD: 1.36,
  CHF: 0.88,
  HKD: 7.82,
  SGD: 1.34,
  KRW: 1320,
  MXN: 17.15,
  BRL: 4.97,
  RUB: 92.50,
  ZAR: 18.65,
  AED: 3.67,
  SAR: 3.75,
  MYR: 4.72,
  THB: 35.50,
  IDR: 15650,
  PHP: 56.20,
  VND: 24500,
  PKR: 278,
  BDT: 110,
  NGN: 1550,
  EGP: 30.90,
  KES: 153,
  GHS: 12.50,
  TZS: 2510,
  UGX: 3780,
  PLN: 4.02,
  CZK: 22.80,
  HUF: 358,
  RON: 4.58,
  TRY: 32.50,
  ILS: 3.72,
  NZD: 1.64,
  SEK: 10.45,
  NOK: 10.65,
  DKK: 6.88,
  ARS: 870,
  CLP: 890,
  COP: 3950,
  PEN: 3.72,
  UAH: 37.50,
};

serve(async (req) => {
  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const supabaseUrl = Deno.env.get("SUPABASE_URL")!;
    const supabaseServiceKey = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!;
    const supabase = createClient(supabaseUrl, supabaseServiceKey);

    // Check if we have cached rates that are less than 1 hour old
    const { data: cachedRates } = await supabase
      .from("site_settings")
      .select("value, updated_at")
      .eq("key", "exchange_rates")
      .single();

    const oneHourAgo = new Date(Date.now() - 60 * 60 * 1000);
    
    if (cachedRates && new Date(cachedRates.updated_at) > oneHourAgo) {
      console.log("Returning cached exchange rates");
      return new Response(
        JSON.stringify({
          success: true,
          rates: cachedRates.value,
          cached: true,
          updated_at: cachedRates.updated_at,
        }),
        { headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    // Fetch fresh rates from free API (exchangerate-api.com or similar)
    let rates = fallbackRates;
    let fetchedFromApi = false;

    try {
      // Using free exchangerate.host API (no API key required)
      const response = await fetch(
        "https://api.exchangerate.host/latest?base=USD"
      );
      
      if (response.ok) {
        const data = await response.json();
        if (data.success !== false && data.rates) {
          rates = { USD: 1 };
          // Map only the currencies we support
          for (const code of Object.keys(fallbackRates)) {
            if (data.rates[code]) {
              rates[code] = data.rates[code];
            } else {
              rates[code] = fallbackRates[code];
            }
          }
          fetchedFromApi = true;
          console.log("Fetched fresh rates from exchangerate.host");
        }
      }
    } catch (apiError) {
      console.log("Failed to fetch from exchangerate.host, trying backup...");
    }

    // Try backup API if first one failed
    if (!fetchedFromApi) {
      try {
        // Backup: Open Exchange Rates (free tier)
        const response = await fetch(
          "https://open.er-api.com/v6/latest/USD"
        );
        
        if (response.ok) {
          const data = await response.json();
          if (data.result === "success" && data.rates) {
            rates = { USD: 1 };
            for (const code of Object.keys(fallbackRates)) {
              if (data.rates[code]) {
                rates[code] = data.rates[code];
              } else {
                rates[code] = fallbackRates[code];
              }
            }
            fetchedFromApi = true;
            console.log("Fetched fresh rates from open.er-api.com");
          }
        }
      } catch (backupError) {
        console.log("Backup API also failed, using fallback rates");
      }
    }

    // Cache the rates in database
    await supabase
      .from("site_settings")
      .upsert({
        key: "exchange_rates",
        value: rates,
        updated_at: new Date().toISOString(),
      }, { onConflict: "key" });

    return new Response(
      JSON.stringify({
        success: true,
        rates,
        cached: false,
        fetched_from_api: fetchedFromApi,
        updated_at: new Date().toISOString(),
      }),
      { headers: { ...corsHeaders, "Content-Type": "application/json" } }
    );
  } catch (error: any) {
    console.error("Exchange rates error:", error);
    return new Response(
      JSON.stringify({ 
        success: false, 
        error: error.message,
        rates: fallbackRates 
      }),
      { headers: { ...corsHeaders, "Content-Type": "application/json" }, status: 500 }
    );
  }
});