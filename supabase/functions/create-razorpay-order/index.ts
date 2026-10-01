import { createClient } from "npm:@supabase/supabase-js@2";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers":
    "authorization, x-client-info, apikey, content-type",
  "Access-Control-Allow-Methods": "POST, OPTIONS",
};

Deno.serve(async (req) => {
  console.log("====================================");
  console.log("CREATE RAZORPAY ORDER START");
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
  // Only POST allowed
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
    // Supabase environment variables
    // --------------------------------------------------
    const supabaseUrl = Deno.env.get("SUPABASE_URL");
    const supabaseAnonKey = Deno.env.get("SUPABASE_ANON_KEY");

    if (!supabaseUrl || !supabaseAnonKey) {
      throw new Error(
        "Supabase environment variables are missing"
      );
    }

    // --------------------------------------------------
    // Razorpay credentials
    // --------------------------------------------------
    const razorpayKeyId =
      Deno.env.get("RAZORPAY_KEY_ID");

    const razorpayKeySecret =
      Deno.env.get("RAZORPAY_KEY_SECRET");

    console.log(
      "Razorpay Key ID configured:",
      !!razorpayKeyId
    );

    console.log(
      "Razorpay Secret configured:",
      !!razorpayKeySecret
    );

    if (!razorpayKeyId) {
      throw new Error(
        "RAZORPAY_KEY_ID is not configured"
      );
    }

    if (!razorpayKeySecret) {
      throw new Error(
        "RAZORPAY_KEY_SECRET is not configured"
      );
    }

    // --------------------------------------------------
    // Get Authorization header
    // --------------------------------------------------
    const authHeader =
      req.headers.get("Authorization");

    console.log(
      "Authorization header exists:",
      !!authHeader
    );

    console.log(
      "Authorization starts with Bearer:",
      authHeader?.startsWith("Bearer ") ?? false
    );

    if (!authHeader) {
      return new Response(
        JSON.stringify({
          success: false,
          error: "Authorization header is required",
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
    // Validate Bearer token
    // --------------------------------------------------
    if (!authHeader.startsWith("Bearer ")) {
      return new Response(
        JSON.stringify({
          success: false,
          error: "Invalid authorization format",
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
    // Create Supabase client using user's JWT
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
    // Verify logged-in user
    // --------------------------------------------------
    const {
      data: { user },
      error: userError,
    } = await supabase.auth.getUser();

    console.log(
      "Authenticated user ID:",
      user?.id ?? null
    );

    console.log(
      "Supabase auth error:",
      userError?.message ?? null
    );

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

    const amount = Number(body.amount);
    const currency =
      body.currency || "INR";
    const receipt =
      body.receipt || `KEIAN-${Date.now()}`;
    const orderId = body.orderId;

    console.log(
      "Request body received:",
      {
        amount,
        currency,
        receipt,
        orderId,
      }
    );

    // --------------------------------------------------
    // Validate order ID
    // --------------------------------------------------
    if (!orderId) {
      return new Response(
        JSON.stringify({
          success: false,
          error: "orderId is required",
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
    // Validate amount
    // --------------------------------------------------
    if (
      !Number.isFinite(amount) ||
      amount <= 0
    ) {
      return new Response(
        JSON.stringify({
          success: false,
          error: "Invalid payment amount",
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
    // Convert rupees to paise
    // --------------------------------------------------
    const amountInPaise =
      Math.round(amount * 100);

    console.log(
      "Razorpay amount in paise:",
      amountInPaise
    );

    // --------------------------------------------------
    // Razorpay Basic Authentication
    // --------------------------------------------------
    const credentials = btoa(
      `${razorpayKeyId}:${razorpayKeySecret}`
    );

    // --------------------------------------------------
    // Create Razorpay order
    // --------------------------------------------------
    console.log(
      "Calling Razorpay Orders API..."
    );

    const razorpayResponse =
      await fetch(
        "https://api.razorpay.com/v1/orders",
        {
          method: "POST",

          headers: {
            "Content-Type":
              "application/json",

            Authorization:
              `Basic ${credentials}`,
          },

          body: JSON.stringify({
            amount: amountInPaise,
            currency,
            receipt,

            notes: {
              source: "KEIAN",
              user_id: user.id,
              order_id: orderId,
            },
          }),
        }
      );

    console.log(
      "Razorpay response status:",
      razorpayResponse.status
    );

    const razorpayData =
      await razorpayResponse.json();

    // --------------------------------------------------
    // Razorpay API error
    // --------------------------------------------------
    if (!razorpayResponse.ok) {
      console.error(
        "Razorpay API error:",
        razorpayData
      );

      return new Response(
        JSON.stringify({
          success: false,
          error:
            razorpayData?.error
              ?.description ||
            "Failed to create Razorpay order",
        }),
        {
          status: razorpayResponse.status,
          headers: {
            ...corsHeaders,
            "Content-Type":
              "application/json",
          },
        }
      );
    }

    // --------------------------------------------------
    // Success
    // --------------------------------------------------
    console.log(
      "Razorpay order created successfully:",
      razorpayData.id
    );

    return new Response(
      JSON.stringify({
        success: true,
        id: razorpayData.id,
        amount: razorpayData.amount,
        currency: razorpayData.currency,
        receipt: razorpayData.receipt,
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
      "create-razorpay-order error:",
      error
    );

    return new Response(
      JSON.stringify({
        success: false,
        error:
          error instanceof Error
            ? error.message
            : "Failed to create Razorpay order",
      }),
      {
        status: 500,
        headers: {
          ...corsHeaders,
          "Content-Type":
            "application/json",
        },
      }
    );
  }
});