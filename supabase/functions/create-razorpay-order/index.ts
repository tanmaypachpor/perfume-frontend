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
    // ==================================================
    // SUPABASE CONFIGURATION
    // ==================================================

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

    // ==================================================
    // AUTHORIZATION
    // ==================================================

    const authHeader = req.headers.get("Authorization");

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

    const accessToken = authHeader.substring(7);

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

    // ==================================================
    // USER AUTHENTICATION
    // ==================================================

    const supabaseAuth = createClient(
      supabaseUrl,
      supabaseAnonKey
    );

    const {
      data: { user },
      error: userError,
    } = await supabaseAuth.auth.getUser(accessToken);

    if (userError || !user) {
      console.error(
        "Authentication error:",
        userError?.message
      );

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

    console.log("Authenticated user:", user.id);

    // ==================================================
    // ADMIN SUPABASE CLIENT
    //
    // Used to read the actual cart and product prices
    // ==================================================

    const supabaseAdmin = createClient(
      supabaseUrl,
      serviceRoleKey
    );

    // ==================================================
    // REQUEST BODY
    // ==================================================

    const body = await req.json();

    const orderId = body.orderId;

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

    // ==================================================
    // GET ACTUAL USER CART
    //
    // IMPORTANT:
    // We do NOT trust cart data from React.
    // ==================================================

    const {
      data: cartItems,
      error: cartError,
    } = await supabaseAdmin
      .from("cart_items")
      .select(
        "id, product_id, quantity"
      )
      .eq("user_id", user.id);

    if (cartError) {
      console.error(
        "Cart lookup error:",
        cartError
      );

      throw new Error(
        `Unable to read cart: ${cartError.message}`
      );
    }

    if (!cartItems || cartItems.length === 0) {
      return new Response(
        JSON.stringify({
          success: false,
          error: "Your cart is empty",
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
      "Cart items found:",
      cartItems.length
    );

    // ==================================================
    // VALIDATE QUANTITIES
    // ==================================================

    for (const item of cartItems) {
      const quantity = Number(item.quantity);

      if (
        !Number.isInteger(quantity) ||
        quantity <= 0 ||
        quantity > 100
      ) {
        return new Response(
          JSON.stringify({
            success: false,
            error: "Invalid product quantity in cart",
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
    }

    // ==================================================
    // GET ACTUAL PRODUCT PRICES
    // ==================================================

    const productIds = cartItems.map(
      (item) => item.product_id
    );

    const {
      data: products,
      error: productsError,
    } = await supabaseAdmin
      .from("products")
      .select(
        `
        id,
        name,
        price,
        "imageUrl",
        active
        `
      )
      .in("id", productIds);

    if (productsError) {
      console.error(
        "Product lookup error:",
        productsError
      );

      throw new Error(
        `Unable to read products: ${productsError.message}`
      );
    }

    if (!products || products.length === 0) {
      return new Response(
        JSON.stringify({
          success: false,
          error: "No valid products found",
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

    // ==================================================
    // CREATE SERVER-VALIDATED CART
    // ==================================================

    const validatedItems = [];

    for (const cartItem of cartItems) {
      const product = products.find(
        (item) =>
          item.id === cartItem.product_id
      );

      if (!product) {
        return new Response(
          JSON.stringify({
            success: false,
            error:
              `Product ${cartItem.product_id} no longer exists`,
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

      if (!product.active) {
        return new Response(
          JSON.stringify({
            success: false,
            error:
              `${product.name} is currently unavailable`,
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

      const price = Number(product.price);
      const quantity = Number(cartItem.quantity);

      if (!Number.isFinite(price) || price < 0) {
        return new Response(
          JSON.stringify({
            success: false,
            error:
              `Invalid price for ${product.name}`,
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

      validatedItems.push({
        product_id: product.id,
        product_name: product.name,
        quantity,
        price,
        imageUrl: product.imageUrl,
      });
    }

    // ==================================================
    // SERVER-SIDE CALCULATION
    // ==================================================

    const subtotal = validatedItems.reduce(
      (sum, item) =>
        sum +
        item.price * item.quantity,
      0
    );

    // Same shipping rule as your frontend:
    // Orders >= ₹1,999 → FREE
    // Orders below ₹1,999 → ₹99

    const shipping =
      subtotal >= 1999 ? 0 : 99;

    const total =
      subtotal + shipping;

    console.log(
      "SERVER CALCULATED ORDER:",
      {
        subtotal,
        shipping,
        total,
        itemCount: validatedItems.length,
      }
    );

    if (
      !Number.isFinite(total) ||
      total <= 0
    ) {
      throw new Error(
        "Invalid server-calculated order total"
      );
    }

    // ==================================================
    // RAZORPAY CONFIGURATION
    // ==================================================

    const razorpayKeyId =
      Deno.env.get("RAZORPAY_KEY_ID");

    const razorpayKeySecret =
      Deno.env.get("RAZORPAY_KEY_SECRET");

    if (
      !razorpayKeyId ||
      !razorpayKeySecret
    ) {
      throw new Error(
        "Razorpay credentials are not configured"
      );
    }

    // ==================================================
    // CREATE RAZORPAY ORDER
    // ==================================================

    const amountInPaise =
      Math.round(total * 100);

    const receipt =
      `KEIAN-${orderId}`;

    const credentials = btoa(
      `${razorpayKeyId}:${razorpayKeySecret}`
    );

    console.log(
      "Creating Razorpay order with server amount:",
      amountInPaise
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
            currency: "INR",
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
            "Content-Type":
              "application/json",
          },
        }
      );
    }

    // ==================================================
    // SUCCESS
    // ==================================================

    console.log(
      "Razorpay order created:",
      razorpayData.id
    );

    return new Response(
      JSON.stringify({
        success: true,

        id: razorpayData.id,

        amount:
          razorpayData.amount,

        currency:
          razorpayData.currency,

        receipt:
          razorpayData.receipt,

        // Server-calculated values
        subtotal,
        shipping,
        total,

        // Server-validated items
        items: validatedItems,
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
          "Content-Type":
            "application/json",
        },
      }
    );
  }
});