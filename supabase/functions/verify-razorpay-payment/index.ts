import { createClient } from "npm:@supabase/supabase-js@2";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers":
    "authorization, x-client-info, apikey, content-type",
  "Access-Control-Allow-Methods": "POST, OPTIONS",
};

async function generateSignature(
  orderId: string,
  paymentId: string,
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
    encoder.encode(`${orderId}|${paymentId}`)
  );

  return Array.from(new Uint8Array(signature))
    .map((byte) => byte.toString(16).padStart(2, "0"))
    .join("");
}

Deno.serve(async (req) => {
  // --------------------------------------------------
  // CORS
  // --------------------------------------------------

  if (req.method === "OPTIONS") {
    return new Response("ok", {
      headers: corsHeaders,
    });
  }

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

    const supabaseUrl = Deno.env.get("SUPABASE_URL");
    const supabaseAnonKey = Deno.env.get("SUPABASE_ANON_KEY");
    const serviceRoleKey = Deno.env.get("SERVICE_ROLE_KEY");

    if (
      !supabaseUrl ||
      !supabaseAnonKey ||
      !serviceRoleKey
    ) {
      throw new Error(
        "Supabase environment variables are missing"
      );
    }

    // --------------------------------------------------
    // Authorization
    // --------------------------------------------------

    const authHeader = req.headers.get("Authorization");

    if (!authHeader) {
      return new Response(
        JSON.stringify({
          success: false,
          error: "Authorization header is missing",
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
    // Authenticated Supabase client
    // Used for user authentication and ownership checks
    // --------------------------------------------------

    const supabase = createClient(
      supabaseUrl,
      supabaseAnonKey,
      {
        global: {
          headers: {
            Authorization: authHeader,
          },
        },
      }
    );

    // --------------------------------------------------
    // Service-role Supabase client
    // Used only after successful payment verification
    // --------------------------------------------------

    const supabaseAdmin = createClient(
      supabaseUrl,
      serviceRoleKey
    );

    // --------------------------------------------------
    // Verify logged-in user
    // --------------------------------------------------

    const {
      data: { user },
      error: userError,
    } = await supabase.auth.getUser();

    if (userError || !user) {
      return new Response(
        JSON.stringify({
          success: false,
          error: "User is not authenticated",
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
    // Read request body
    // --------------------------------------------------

    const body = await req.json();

    const orderId = body.orderId;
    const razorpayOrderId = body.razorpayOrderId;
    const razorpayPaymentId = body.razorpayPaymentId;
    const razorpaySignature = body.razorpaySignature;

    if (
      !orderId ||
      !razorpayOrderId ||
      !razorpayPaymentId ||
      !razorpaySignature
    ) {
      return new Response(
        JSON.stringify({
          success: false,
          error: "Missing payment verification parameters",
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
    // Get Razorpay secret
    // --------------------------------------------------

    const razorpayKeySecret =
      Deno.env.get("RAZORPAY_KEY_SECRET");

    if (!razorpayKeySecret) {
      throw new Error(
        "RAZORPAY_KEY_SECRET is not configured"
      );
    }

    // --------------------------------------------------
    // Find customer's order
    // --------------------------------------------------

    const {
      data: existingOrder,
      error: existingOrderError,
    } = await supabase
      .from("orders")
      .select(
        "id, user_id, razorpay_order_id, payment_status"
      )
      .eq("id", orderId)
      .eq("user_id", user.id)
      .single();

    if (existingOrderError || !existingOrder) {
      console.error(
        "Existing order error:",
        existingOrderError
      );

      return new Response(
        JSON.stringify({
          success: false,
          error: "Order not found",
        }),
        {
          status: 404,
          headers: {
            ...corsHeaders,
            "Content-Type": "application/json",
          },
        }
      );
    }

    // --------------------------------------------------
    // Prevent duplicate payment verification
    // --------------------------------------------------

   if (existingOrder.payment_status === "PAID") {
  return new Response(
    JSON.stringify({
      success: true,
      message: "Payment already verified",
      orderId: existingOrder.id,
    }),
    {
      status: 200,
      headers: {
        ...corsHeaders,
        "Content-Type": "application/json",
      },
    }
  );
}

    // --------------------------------------------------
    // Verify Razorpay Order ID
    // --------------------------------------------------

    if (
      existingOrder.razorpay_order_id &&
      existingOrder.razorpay_order_id !== razorpayOrderId
    ) {
      return new Response(
        JSON.stringify({
          success: false,
          error: "Razorpay order mismatch",
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
    // Generate expected Razorpay signature
    // --------------------------------------------------

    const expectedSignature =
      await generateSignature(
        razorpayOrderId,
        razorpayPaymentId,
        razorpayKeySecret
      );

    // --------------------------------------------------
    // Compare signatures
    // --------------------------------------------------

    if (expectedSignature !== razorpaySignature) {
      return new Response(
        JSON.stringify({
          success: false,
          error: "Payment signature verification failed",
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
    // Update order using SERVICE ROLE
    // --------------------------------------------------

    const {
      data: order,
      error: orderError,
    } = await supabaseAdmin
      .from("orders")
      .update({
        razorpay_order_id: razorpayOrderId,
        razorpay_payment_id: razorpayPaymentId,
        razorpay_signature: razorpaySignature,
        payment_status: "PAID",
        order_status: "CONFIRMED",
      })
      .eq("id", orderId)
      .eq("user_id", user.id)
      .select()
      .single();

    if (orderError) {
      console.error(
        "Order update error:",
        orderError
      );

      return new Response(
        JSON.stringify({
          success: false,
          error: "Unable to update order",
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

    // --------------------------------------------------
    // Success
    // --------------------------------------------------

    return new Response(
      JSON.stringify({
        success: true,
        message: "Payment verified successfully",
        order,
      }),
      {
        status: 200,
        headers: {
          ...corsHeaders,
          "Content-Type": "application/json",
        },
      }
    );
  } catch (error) {
    console.error(
      "verify-razorpay-payment error:",
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