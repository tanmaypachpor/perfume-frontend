import { createClient } from "npm:@supabase/supabase-js@2";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers":
    "authorization, x-client-info, apikey, content-type, x-razorpay-signature",
  "Access-Control-Allow-Methods": "POST, OPTIONS",
};

// --------------------------------------------------
// Convert ArrayBuffer to hexadecimal string
// --------------------------------------------------
function bufferToHex(buffer: ArrayBuffer): string {
  return Array.from(new Uint8Array(buffer))
    .map((byte) => byte.toString(16).padStart(2, "0"))
    .join("");
}

// --------------------------------------------------
// Generate HMAC SHA256
// --------------------------------------------------
async function generateSignature(
  payload: string,
  secret: string
): Promise<string> {
  const encoder = new TextEncoder();

  const key = await crypto.subtle.importKey(
    "raw",
    encoder.encode(secret),
    {
      name: "HMAC",
      hash: "SHA-256",
    },
    false,
    ["sign"]
  );

  const signature = await crypto.subtle.sign(
    "HMAC",
    key,
    encoder.encode(payload)
  );

  return bufferToHex(signature);
}

// --------------------------------------------------
// Compare signatures safely
// --------------------------------------------------
function safeCompare(
  a: string,
  b: string
): boolean {
  if (a.length !== b.length) {
    return false;
  }

  let result = 0;

  for (let i = 0; i < a.length; i++) {
    result |= a.charCodeAt(i) ^ b.charCodeAt(i);
  }

  return result === 0;
}

// --------------------------------------------------
// Edge Function
// --------------------------------------------------
Deno.serve(async (req) => {
  console.log("====================================");
  console.log("RAZORPAY WEBHOOK START");
  console.log("Method:", req.method);
  console.log("====================================");

  // --------------------------------------------------
  // CORS
  // --------------------------------------------------
  if (req.method === "OPTIONS") {
    return new Response("ok", {
      headers: corsHeaders,
    });
  }

  // --------------------------------------------------
  // POST only
  // --------------------------------------------------
  if (req.method !== "POST") {
    return new Response(
      JSON.stringify({
        success: false,
        error: "Method not allowed",
      }),
      {
        status: 405,
        headers: {
          ...corsHeaders,
          "Content-Type": "application/json",
        },
      }
    );
  }

  try {
    // --------------------------------------------------
    // Supabase configuration
    // --------------------------------------------------
    const supabaseUrl =
      Deno.env.get("SUPABASE_URL");

    // IMPORTANT:
    // Your project uses SERVICE_ROLE_KEY
    // instead of SUPABASE_SERVICE_ROLE_KEY.
    const serviceRoleKey =
      Deno.env.get("SERVICE_ROLE_KEY");

    if (!supabaseUrl) {
      console.error(
        "SUPABASE_URL is missing"
      );

      throw new Error(
        "SUPABASE_URL is not configured"
      );
    }

    if (!serviceRoleKey) {
      console.error(
        "SERVICE_ROLE_KEY is missing"
      );

      throw new Error(
        "SERVICE_ROLE_KEY is not configured"
      );
    }

    // --------------------------------------------------
    // Razorpay webhook secret
    // --------------------------------------------------
    const webhookSecret =
      Deno.env.get("RAZORPAY_WEBHOOK_SECRET");

    if (!webhookSecret) {
      console.error(
        "RAZORPAY_WEBHOOK_SECRET is missing"
      );

      throw new Error(
        "RAZORPAY_WEBHOOK_SECRET is not configured"
      );
    }

    // --------------------------------------------------
    // Get Razorpay signature
    // --------------------------------------------------
    const razorpaySignature =
      req.headers.get("x-razorpay-signature");

    console.log(
      "Razorpay signature exists:",
      !!razorpaySignature
    );

    if (!razorpaySignature) {
      return new Response(
        JSON.stringify({
          success: false,
          error:
            "x-razorpay-signature header is missing",
        }),
        {
          status: 401,
          headers: {
            ...corsHeaders,
            "Content-Type": "application/json",
          },
        }
      );
    }

    // --------------------------------------------------
    // Read RAW request body
    //
    // IMPORTANT:
    // Razorpay webhook signature must be calculated
    // using the exact raw request body.
    // --------------------------------------------------
    const rawBody = await req.text();

    if (!rawBody) {
      return new Response(
        JSON.stringify({
          success: false,
          error: "Empty webhook body",
        }),
        {
          status: 400,
          headers: {
            ...corsHeaders,
            "Content-Type": "application/json",
          },
        }
      );
    }

    // --------------------------------------------------
    // Generate expected signature
    // --------------------------------------------------
    const expectedSignature =
      await generateSignature(
        rawBody,
        webhookSecret
      );

    const signatureIsValid =
      safeCompare(
        expectedSignature,
        razorpaySignature
      );

    console.log(
      "Webhook signature valid:",
      signatureIsValid
    );

    // --------------------------------------------------
    // Verify Razorpay signature
    // --------------------------------------------------
    if (!signatureIsValid) {
      console.error(
        "Invalid Razorpay webhook signature"
      );

      return new Response(
        JSON.stringify({
          success: false,
          error: "Invalid webhook signature",
        }),
        {
          status: 401,
          headers: {
            ...corsHeaders,
            "Content-Type": "application/json",
          },
        }
      );
    }

    // --------------------------------------------------
    // Parse webhook body
    // --------------------------------------------------
    let payload: any;

    try {
      payload = JSON.parse(rawBody);
    } catch (parseError) {
      console.error(
        "Invalid JSON payload:",
        parseError
      );

      return new Response(
        JSON.stringify({
          success: false,
          error: "Invalid webhook JSON",
        }),
        {
          status: 400,
          headers: {
            ...corsHeaders,
            "Content-Type": "application/json",
          },
        }
      );
    }

    console.log(
      "Razorpay webhook event:",
      payload?.event
    );

    // --------------------------------------------------
    // Create Supabase admin client
    // --------------------------------------------------
    const supabase = createClient(
      supabaseUrl,
      serviceRoleKey
    );

    // ==================================================
    // PAYMENT CAPTURED
    // ==================================================
    if (
      payload.event === "payment.captured"
    ) {
      const payment =
        payload?.payload?.payment?.entity;

      if (!payment) {
        console.error(
          "Payment entity missing from webhook"
        );

        return new Response(
          JSON.stringify({
            success: false,
            error:
              "Payment entity missing",
          }),
          {
            status: 400,
            headers: {
              ...corsHeaders,
              "Content-Type":
                "application/json",
            },
          }
        );
      }

      const razorpayPaymentId =
        payment.id;

      const razorpayOrderId =
        payment.order_id;

      console.log(
        "Payment captured:",
        {
          razorpayPaymentId,
          razorpayOrderId,
          status: payment.status,
        }
      );

      // --------------------------------------------------
      // Validate Razorpay order ID
      // --------------------------------------------------
      if (!razorpayOrderId) {
        console.error(
          "Razorpay order ID missing"
        );

        return new Response(
          JSON.stringify({
            success: false,
            error:
              "Razorpay order ID missing",
          }),
          {
            status: 400,
            headers: {
              ...corsHeaders,
              "Content-Type":
                "application/json",
            },
          }
        );
      }

      // --------------------------------------------------
      // Find local order
      // --------------------------------------------------
      const {
        data: existingOrder,
        error: findError,
      } = await supabase
        .from("orders")
        .select(
          "id, payment_status, order_status"
        )
        .eq(
          "razorpay_order_id",
          razorpayOrderId
        )
        .maybeSingle();

      if (findError) {
        console.error(
          "Order lookup error:",
          findError.message
        );

        throw new Error(
          findError.message
        );
      }

      // --------------------------------------------------
      // Local order does not exist
      // --------------------------------------------------
      if (!existingOrder) {
        console.error(
          "Local order not found:",
          razorpayOrderId
        );

        // Return 200 so Razorpay does not
        // repeatedly retry this event.
        return new Response(
          JSON.stringify({
            success: true,
            message:
              "Order not found locally",
          }),
          {
            status: 200,
            headers: {
              ...corsHeaders,
              "Content-Type":
                "application/json",
            },
          }
        );
      }

      // --------------------------------------------------
      // Idempotency
      //
      // If already PAID, don't process again.
      // --------------------------------------------------
      if (
        existingOrder.payment_status ===
        "PAID"
      ) {
        console.log(
          "Order already marked PAID:",
          existingOrder.id
        );

        return new Response(
          JSON.stringify({
            success: true,
            message:
              "Order already processed",
          }),
          {
            status: 200,
            headers: {
              ...corsHeaders,
              "Content-Type":
                "application/json",
            },
          }
        );
      }

      // --------------------------------------------------
      // Update order as PAID
      // --------------------------------------------------
      const {
        error: updateError,
      } = await supabase
        .from("orders")
        .update({
          razorpay_payment_id:
            razorpayPaymentId,

          payment_status: "PAID",

          order_status: "CONFIRMED",
        })
        .eq(
          "razorpay_order_id",
          razorpayOrderId
        );

      if (updateError) {
        console.error(
          "Failed to update order:",
          updateError.message
        );

        throw new Error(
          updateError.message
        );
      }

      console.log(
        "Order successfully marked PAID:",
        existingOrder.id
      );
    }

    // ==================================================
    // PAYMENT FAILED
    // ==================================================
    else if (
      payload.event === "payment.failed"
    ) {
      const payment =
        payload?.payload?.payment?.entity;

      if (!payment) {
        console.error(
          "Failed payment entity missing"
        );

        return new Response(
          JSON.stringify({
            success: false,
            error:
              "Payment entity missing",
          }),
          {
            status: 400,
            headers: {
              ...corsHeaders,
              "Content-Type":
                "application/json",
            },
          }
        );
      }

      const razorpayPaymentId =
        payment.id;

      const razorpayOrderId =
        payment.order_id;

      console.log(
        "Payment failed:",
        {
          razorpayPaymentId,
          razorpayOrderId,
        }
      );

      // --------------------------------------------------
      // Update failed payment
      // --------------------------------------------------
      if (razorpayOrderId) {
        const {
          error: updateError,
        } = await supabase
          .from("orders")
          .update({
            razorpay_payment_id:
              razorpayPaymentId,

            payment_status: "FAILED",
          })
          .eq(
            "razorpay_order_id",
            razorpayOrderId
          );

        if (updateError) {
          console.error(
            "Failed to update failed payment:",
            updateError.message
          );

          throw new Error(
            updateError.message
          );
        }

        console.log(
          "Order marked as FAILED:",
          razorpayOrderId
        );
      }
    }

    // ==================================================
    // OTHER EVENTS
    // ==================================================
    else {
      console.log(
        "Unhandled Razorpay event:",
        payload?.event
      );
    }

    // --------------------------------------------------
    // Success response
    // --------------------------------------------------
    return new Response(
      JSON.stringify({
        success: true,
        received: true,
      }),
      {
        status: 200,
        headers: {
          ...corsHeaders,
          "Content-Type":
            "application/json",
        },
      }
    );
  } catch (error) {
    console.error(
      "RAZORPAY WEBHOOK ERROR:",
      error
    );

    return new Response(
      JSON.stringify({
        success: false,
        error:
          error instanceof Error
            ? error.message
            : "Internal server error",
      }),
      {
        status: 500,
        headers: {
          ...corsHeaders,
          "Content-Type": "application/json",
        },
      }
    );
  }
});