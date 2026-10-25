import crypto from "crypto";

export interface CreateOrderParams {
  orderId: string;
  orderAmount: number; // in standard currency units (e.g. 499.00), computed from minorUnits / 100
  orderCurrency?: string;
  customerDetails: {
    customerId: string;
    customerEmail: string;
    customerPhone?: string;
    customerName: string;
  };
  orderMeta?: {
    returnUrl?: string;
    notifyUrl?: string;
  };
  orderNote?: string;
}

export interface CashfreeOrderResponse {
  cfOrderId: string;
  orderId: string;
  orderStatus: "ACTIVE" | "PAID" | "EXPIRED" | "TERMINATED";
  paymentSessionId: string;
  orderAmount: number;
  orderCurrency: string;
  paymentLink?: string;
}

export interface CashfreePaymentDetails {
  paymentId: string;
  orderId: string;
  paymentStatus: "SUCCESS" | "FAILED" | "PENDING" | "USER_DROPPED" | "CANCELLED";
  paymentAmount: number;
  paymentCurrency: string;
  paymentTime?: string;
  paymentMethod?: string;
  raw: unknown;
}

export interface PaymentGatewayStatus {
  isConfigured: boolean;
  environment: "SANDBOX" | "PRODUCTION";
  apiVersion: string;
  missingKeys: string[];
}

export class CashfreePaymentProvider {
  private appId: string;
  private secretKey: string;
  private env: "SANDBOX" | "PRODUCTION";
  private apiVersion: string;

  constructor() {
    this.appId = process.env.CASHFREE_APP_ID || "";
    this.secretKey = process.env.CASHFREE_SECRET_KEY || "";
    this.env = (process.env.CASHFREE_ENV?.toUpperCase() === "PRODUCTION" ? "PRODUCTION" : "SANDBOX");
    this.apiVersion = process.env.CASHFREE_API_VERSION || "2023-08-01";
  }

  public getStatus(): PaymentGatewayStatus {
    const missingKeys: string[] = [];
    if (!this.appId || this.appId.includes("TEST_APP_ID_MOCK") || this.appId.length < 5) {
      missingKeys.push("CASHFREE_APP_ID");
    }
    if (!this.secretKey || this.secretKey.includes("TEST_SECRET_KEY_MOCK") || this.secretKey.length < 5) {
      missingKeys.push("CASHFREE_SECRET_KEY");
    }

    return {
      isConfigured: missingKeys.length === 0,
      environment: this.env,
      apiVersion: this.apiVersion,
      missingKeys,
    };
  }

  private getBaseUrl(): string {
    return this.env === "PRODUCTION"
      ? "https://api.cashfree.com/pg"
      : "https://sandbox.cashfree.com/pg";
  }

  private getHeaders(): Record<string, string> {
    return {
      "Content-Type": "application/json",
      "x-api-version": this.apiVersion,
      "x-client-id": this.appId,
      "x-client-secret": this.secretKey,
    };
  }

  /**
   * Creates an order in Cashfree DevStudio PG API (v2023-08-01)
   */
  public async createOrder(params: CreateOrderParams): Promise<CashfreeOrderResponse> {
    const status = this.getStatus();
    if (!status.isConfigured) {
      throw new Error(
        `Cashfree Gateway is not configured. Missing required server credentials: ${status.missingKeys.join(", ")}`
      );
    }

    const payload = {
      order_id: params.orderId,
      order_amount: params.orderAmount,
      order_currency: params.orderCurrency || "INR",
      customer_details: {
        customer_id: params.customerDetails.customerId,
        customer_email: params.customerDetails.customerEmail,
        customer_phone: params.customerDetails.customerPhone || "9999999999",
        customer_name: params.customerDetails.customerName,
      },
      order_meta: {
        return_url: params.orderMeta?.returnUrl,
        notify_url: params.orderMeta?.notifyUrl,
      },
      order_note: params.orderNote || "Harsh Unlimited Store Order",
    };

    const url = `${this.getBaseUrl()}/orders`;
    const response = await fetch(url, {
      method: "POST",
      headers: this.getHeaders(),
      body: JSON.stringify(payload),
    });

    const data = await response.json();

    if (!response.ok) {
      const errMsg = data.message || data.error || `HTTP ${response.status} from Cashfree API`;
      throw new Error(`Cashfree order creation failed: ${errMsg}`);
    }

    return {
      cfOrderId: String(data.cf_order_id),
      orderId: data.order_id,
      orderStatus: data.order_status,
      paymentSessionId: data.payment_session_id,
      orderAmount: data.order_amount,
      orderCurrency: data.order_currency,
      paymentLink: data.payment_link || undefined,
    };
  }

  /**
   * Verifies the authenticity of Cashfree Webhooks.
   * Cashfree signs webhooks with HMAC-SHA256 over:
   * signature_payload = timestamp + rawBody
   * signature = Base64(HMAC_SHA256(signature_payload, secret_key))
   */
  public verifyWebhookSignature(
    rawBody: string,
    signature: string,
    timestamp: string
  ): boolean {
    if (!signature || !timestamp || !this.secretKey) {
      return false;
    }

    try {
      const signaturePayload = `${timestamp}${rawBody}`;
      const expectedSignature = crypto
        .createHmac("sha256", this.secretKey)
        .update(signaturePayload)
        .digest("base64");

      // Constant-time buffer comparison to prevent timing attacks
      const signatureBuffer = Buffer.from(signature, "base64");
      const expectedBuffer = Buffer.from(expectedSignature, "base64");

      if (signatureBuffer.length !== expectedBuffer.length) {
        return false;
      }

      return crypto.timingSafeEqual(signatureBuffer, expectedBuffer);
    } catch {
      return false;
    }
  }

  /**
   * Fetches official order payment status directly from Cashfree PG API
   */
  public async getOrderPayments(orderId: string): Promise<CashfreePaymentDetails[]> {
    const status = this.getStatus();
    if (!status.isConfigured) {
      throw new Error(`Cashfree Gateway credentials missing`);
    }

    const url = `${this.getBaseUrl()}/orders/${encodeURIComponent(orderId)}/payments`;
    const response = await fetch(url, {
      method: "GET",
      headers: this.getHeaders(),
    });

    if (!response.ok) {
      const err = await response.text();
      throw new Error(`Failed to query Cashfree order payments: ${err}`);
    }

    const payments = await response.json();
    if (!Array.isArray(payments)) {
      return [];
    }

    return payments.map((p: any) => ({
      paymentId: String(p.cf_payment_id || p.payment_id),
      orderId: p.order_id,
      paymentStatus: (p.payment_status || "PENDING").toUpperCase(),
      paymentAmount: Number(p.payment_amount),
      paymentCurrency: p.payment_currency || "INR",
      paymentTime: p.payment_completion_time || p.payment_time,
      paymentMethod: p.payment_group || "UNKNOWN",
      raw: p,
    }));
  }
}

export const cashfreeProvider = new CashfreePaymentProvider();
