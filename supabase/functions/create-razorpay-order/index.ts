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
  console.log(
    "Authorization header exists:",
    !!req.headers.get("Authorization")
  );
  console.log("====================================");

  // ---------------------------------------------
  // CORS
  // ---------------------------------------------
  if (req.method === "OPTIONS") {
    return new Response("ok", {
      headers: corsHeaders,
    });
  }

  // ---------------------------------------------
  // POST only
  // ---------------------------------------------
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
    // ---------------------------------------------
    // SUPABASE CONFIG
    // ---------------------------------------------
    const supabaseUrl = Deno.env.get("SUPABASE_URL");
    const supabaseAnonKey = Deno.env.get("SUPABASE_ANON_KEY");

    if (!supabaseUrl || !supabaseAnonKey) {
      throw new Error(
        "Supabase environment variables are missing"
      );
    }

    // ---------------------------------------------
    // AUTHORIZATION HEADER
    // ---------------------------------------------
    const authHeader = req.headers.get("Authorization");

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

    // ---------------------------------------------
    // EXTRACT ACCESS TOKEN
    // ---------------------------------------------
    const accessToken = authHeader.substring(7);

    console.log(
      "Access token received:",
      !!accessToken
    );

    if (!accessToken) {
      return new Response(
        JSON.stringify({
          success: false,
          error: "Access token is missing",
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

    // ---------------------------------------------
    // CREATE SUPABASE CLIENT
    // ---------------------------------------------
    const supabase = createClient(
      supabaseUrl,
      supabaseAnonKey
    );

    // ---------------------------------------------
    // VERIFY USER USING ACCESS TOKEN
    // ---------------------------------------------
    const {
      data: { user },
      error: userError,
    } = await supabase.auth.getUser(accessToken);

    console.log(
      "Authenticated user ID:",
      user?.id ?? null
    );

    console.log(
      "Supabase auth error:",
      userError?.message ?? null
    );

    if (userError || !user) {
      console.error(
        "AUTH ERROR:",
        userError?.message ?? "No authenticated user"
      );

      return new Response(
        JSON.stringify({
          success: false,
          error: "User is not authenticated",
          details: userError?.message ?? null,
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

    // ---------------------------------------------
    // RAZORPAY CREDENTIALS
    // ---------------------------------------------
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

    if (!razorpayKeyId || !razorpayKeySecret) {
      throw new Error(
        "Razorpay credentials are not configured"
      );
    }

    // ---------------------------------------------
    // REQUEST BODY
    // ---------------------------------------------
    const body = await req.json();

    const amount = Number(body.amount);
    const currency = body.currency || "INR";
    const receipt =
      body.receipt || `KEIAN-${Date.now()}`;
    const orderId = body.orderId;

    console.log("Request body:", {
      amount,
      currency,
      receipt,
      orderId,
    });

    // ---------------------------------------------
    // VALIDATE ORDER ID
    // ---------------------------------------------
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

    // ---------------------------------------------
    // VALIDATE AMOUNT
    // ---------------------------------------------
    if (!Number.isFinite(amount) || amount <= 0) {
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

    // ---------------------------------------------
    // CONVERT RUPEES → PAISE
    // ---------------------------------------------
    const amountInPaise =
      Math.round(amount * 100);

    console.log(
      "Amount in paise:",
      amountInPaise
    );

    // ---------------------------------------------
    // RAZORPAY BASIC AUTH
    // ---------------------------------------------
    const credentials = btoa(
      `${razorpayKeyId}:${razorpayKeySecret}`
    );

    // ---------------------------------------------
    // CREATE RAZORPAY ORDER
    // ---------------------------------------------
    console.log(
      "Calling Razorpay Orders API..."
    );

    const razorpayResponse = await fetch(
      "https://api.razorpay.com/v1/orders",
      {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Basic ${credentials}`,
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

    const razorpayData =
      await razorpayResponse.json();

    console.log(
      "Razorpay response status:",
      razorpayResponse.status
    );

    // ---------------------------------------------
    // RAZORPAY ERROR
    // ---------------------------------------------
    if (!razorpayResponse.ok) {
      console.error(
        "Razorpay API error:",
        razorpayData
      );

      return new Response(
        JSON.stringify({
          success: false,
          error:
            razorpayData?.error?.description ||
            "Razorpay order creation failed",
        }),
        {
          status: razorpayResponse.status,
          headers: {
            ...corsHeaders,
            "Content-Type": "application/json",
          },
        }
      );
    }

    // ---------------------------------------------
    // SUCCESS
    // ---------------------------------------------
    console.log(
      "Razorpay order created:",
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
          "Content-Type": "application/json",
        },
      }
    );
  } catch (error) {
    console.error(
      "CREATE RAZORPAY ORDER ERROR:",
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