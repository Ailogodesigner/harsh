import crypto from "node:crypto";

export type PayZapiProvider = "fampay" | "paytm" | "bharatpe" | "binance";

export interface CreatePayZapiOrderInput {
  amount: number;
  paymentProvider?: PayZapiProvider;
  clientOrderId?: string;
  customerName?: string;
  customerEmail?: string;
  description?: string;
  redirectUrl?: string;
  expiryMinutes?: number;
}

export interface PayZapiOrderResponse {
  ok: boolean;
  order_id?: string;
  payment_url?: string;
  qr_data?: string;
  deep_link?: string;
  amount?: number;
  provider?: string;
  status?: string;
  error?: string;
  [key: string]: any;
}

export interface PayZapiStatusResponse {
  ok: boolean;
  order_id: string;
  status: "completed" | "pending" | "expired" | string;
  amount?: number;
  utr?: string;
  paid_at?: string;
  error?: string;
  [key: string]: any;
}

const PAYZAPI_BASE_URL = process.env.PAYZAPI_BASE_URL || "https://payzapi.in/api/v1";

/**
 * Get the configured PayZapi API key from environment
 */
export function getPayZapiApiKey(): string | undefined {
  return process.env.PAYZAPI_API_KEY?.trim();
}

/**
 * Get the configured PayZapi Webhook Secret from environment
 */
export function getPayZapiWebhookSecret(): string | undefined {
  return process.env.PAYZAPI_WEBHOOK_SECRET?.trim();
}

/**
 * Creates a payment order via PayZapi REST API
 * POST https://payzapi.in/api/v1/create
 */
export async function createPayZapiOrder(
  input: CreatePayZapiOrderInput
): Promise<PayZapiOrderResponse> {
  const apiKey = getPayZapiApiKey();

  if (!apiKey) {
    console.warn("[PayZapi] PAYZAPI_API_KEY is not configured in environment variables.");
    return {
      ok: false,
      error: "PAYZAPI_API_KEY_MISSING: Please configure PAYZAPI_API_KEY in your environment.",
    };
  }

  const payload = {
    amount: Number(input.amount.toFixed(2)),
    payment_provider: input.paymentProvider || (process.env.PAYZAPI_DEFAULT_PROVIDER as PayZapiProvider) || "fampay",
    client_order_id: input.clientOrderId,
    customer_name: input.customerName || "Customer",
    customer_email: input.customerEmail,
    description: input.description || "Order Payment",
    redirect_url: input.redirectUrl,
    expiry_minutes: input.expiryMinutes || 15,
  };

  try {
    const res = await fetch(`${PAYZAPI_BASE_URL}/create`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        "x-api-key": apiKey,
      },
      body: JSON.stringify(payload),
      signal: AbortSignal.timeout(10000),
    });

    const data = await res.json();

    if (!res.ok) {
      return {
        ok: false,
        error: data.message || data.error || `HTTP_${res.status}: Failed to create PayZapi order`,
        ...data,
      };
    }

    return {
      ok: true,
      ...data,
      // Normalize hosted checkout payment url
      payment_url: data.payment_url || (data.order_id ? `https://payzapi.in/pay/${data.order_id}` : undefined),
    };
  } catch (err: any) {
    console.error("[PayZapi] Order creation error:", err);
    return {
      ok: false,
      error: err.message || "Failed to reach PayZapi payment service.",
    };
  }
}

/**
 * Queries real-time order status
 * GET https://payzapi.in/api/v1/check?order_id={id}
 */
export async function checkPayZapiOrderStatus(
  orderId: string
): Promise<PayZapiStatusResponse> {
  const apiKey = getPayZapiApiKey();

  if (!apiKey) {
    return {
      ok: false,
      order_id: orderId,
      status: "unknown",
      error: "PAYZAPI_API_KEY_MISSING",
    };
  }

  try {
    const res = await fetch(
      `${PAYZAPI_BASE_URL}/check?order_id=${encodeURIComponent(orderId)}`,
      {
        method: "GET",
        headers: {
          "x-api-key": apiKey,
        },
        signal: AbortSignal.timeout(8000),
      }
    );

    const data = await res.json();
    return {
      ok: res.ok,
      order_id: orderId,
      status: data.status || (res.ok ? "completed" : "pending"),
      ...data,
    };
  } catch (err: any) {
    console.error("[PayZapi] Status check error:", err);
    return {
      ok: false,
      order_id: orderId,
      status: "pending",
      error: err.message || "Network error while checking order status",
    };
  }
}

/**
 * Cryptographic HMAC-SHA256 signature verification for PayZapi webhooks
 * Validates X-FamPay-Signature or X-PayZapi-Signature header against the raw body
 */
export function verifyPayZapiSignature(
  rawBody: string,
  receivedSignature: string | null | undefined,
  secret?: string
): boolean {
  const secretKey = secret || getPayZapiWebhookSecret();

  if (!secretKey || !receivedSignature) {
    return false;
  }

  try {
    const computedSignature = crypto
      .createHmac("sha256", secretKey)
      .update(rawBody)
      .digest("hex");

    const expectedBuffer = Buffer.from(computedSignature, "utf-8");
    const receivedBuffer = Buffer.from(receivedSignature, "utf-8");

    if (expectedBuffer.length !== receivedBuffer.length) {
      return false;
    }

    return crypto.timingSafeEqual(expectedBuffer, receivedBuffer);
  } catch (err) {
    console.error("[PayZapi] Signature validation exception:", err);
    return false;
  }
}
