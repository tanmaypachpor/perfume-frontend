import { useCallback, useEffect, useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { Navbar, Footer } from "@/shared/components/layout/SiteChrome";
import "@/features/cart/pages/Cart.css";
import { CartLineItem } from "@/features/cart/components/CartLineItem";
import { CartOrderSummary } from "@/features/cart/components/CartOrderSummary";

import { supabase } from "@/shared/lib/supabaseClient";

/* =========================================================
   PRODUCT INTERFACE
========================================================= */

interface Product {
    id: number;
    name: string;
    category: string;
    collection?: string;
    type?: string;
    price: number;
    description: string;
    imageUrl: string;
    secondUrl?: string;
    tag: string;

    rating?: number;
    reviewCount?: number;
    topNotes?: string;
    heartNotes?: string;
    baseNotes?: string;
    fragranceFamily?: string;
    concentration?: string;
    volume?: string;
    gender?: string;
    occasion?: string;
    longevity?: string;
}

/* =========================================================
   SUPABASE CART ITEM
========================================================= */

interface SupabaseCartItem {
    id: number;
    user_id: string;
    product_id: number;
    quantity: number;
    created_at: string;
}

/* =========================================================
   CART ITEM USED BY UI
========================================================= */

interface CartItem extends Product {
    quantity: number;
    cartItemId: number;
}

/* =========================================================
   CART
========================================================= */

function Cart() {
    const [cart, setCart] = useState<CartItem[]>([]);
    const [loading, setLoading] = useState(true);
    const [updatingItemIds, setUpdatingItemIds] = useState<Set<number>>(
        () => new Set()
    );

    const navigate = useNavigate();

    /* =========================================================
       LOAD CART
    ========================================================= */

    const loadCart = useCallback(async () => {
        try {
            /* =================================================
               GET LOGGED-IN USER
            ================================================= */

            const {
                data: { user },
                error: userError,
            } = await supabase.auth.getUser();

            if (userError) {
                console.error(
                    "Unable to get user:",
                    userError
                );

                setCart([]);
                return;
            }

            /* =================================================
               USER NOT LOGGED IN
            ================================================= */

            if (!user) {
                setCart([]);
                return;
            }

            /* =================================================
               GET USER CART
            ================================================= */

            const {
                data: cartItems,
                error: cartError,
            } = await supabase
                .from("cart_items")
                .select("*")
                .eq("user_id", user.id)
                .order("created_at", {
                    ascending: true,
                });

            if (cartError) {
                console.error(
                    "Unable to load cart:",
                    cartError
                );

                setCart([]);
                return;
            }

            if (!cartItems || cartItems.length === 0) {
                setCart([]);
                return;
            }

            /* =================================================
               GET PRODUCT IDS
            ================================================= */

            const productIds = cartItems.map(
                (item: SupabaseCartItem) =>
                    item.product_id
            );

            /* =================================================
               GET PRODUCTS
            ================================================= */

            const {
                data: products,
                error: productsError,
            } = await supabase
                .from("products")
                .select(
                    `
                    id,
                    name,
                    category,
                    collection,
                    price,
                    description,
                    "imageUrl",
                    "secondUrl",
                    tag
                    `
                )
                .in("id", productIds)
                .eq("active", true);

            if (productsError) {
                console.error(
                    "Unable to load cart products:",
                    productsError
                );

                setCart([]);
                return;
            }

            /* =================================================
               COMBINE CART + PRODUCT DATA
            ================================================= */

            const combinedCart: CartItem[] =
                cartItems
                    .map(
                        (
                            cartItem: SupabaseCartItem
                        ) => {
                            const product =
                                products?.find(
                                    (item) =>
                                        Number(
                                            item.id
                                        ) ===
                                        Number(
                                            cartItem.product_id
                                        )
                                );

                            if (!product) {
                                return null;
                            }

                            return {
                                ...(product as Product),
                                quantity:
                                    cartItem.quantity,
                                cartItemId:
                                    cartItem.id,
                            };
                        }
                    )
                    .filter(
                        (
                            item
                        ): item is CartItem =>
                            item !== null
                    );

            setCart(combinedCart);

        } catch (error) {
            console.error(
                "Cart loading error:",
                error
            );

            setCart([]);

        } finally {
            setLoading(false);
        }
    }, []);

    useEffect(() => {
        void loadCart();
    }, [loadCart]);

    /* =========================================================
       INCREASE QUANTITY
    ========================================================= */

    const increaseQuantity = async (
        cartItemId: number
    ) => {
        if (updatingItemIds.has(cartItemId)) {
            return;
        }

        const item = cart.find(
            (cartItem) =>
                cartItem.cartItemId === cartItemId
        );

        if (!item) {
            return;
        }

        const newQuantity = item.quantity + 1;
        setUpdatingItemIds((current) => new Set(current).add(cartItemId));
        setCart((currentCart) =>
            currentCart.map((cartItem) =>
                cartItem.cartItemId === cartItemId
                    ? { ...cartItem, quantity: newQuantity }
                    : cartItem
            )
        );

        try {
            const { error } =
                await supabase
                    .from("cart_items")
                    .update({
                        quantity: newQuantity,
                    })
                    .eq("id", cartItemId);

            if (error) {
                console.error(
                    "Unable to increase quantity:",
                    error
                );
                setCart((currentCart) =>
                    currentCart.map((cartItem) =>
                        cartItem.cartItemId === cartItemId
                            ? { ...cartItem, quantity: item.quantity }
                            : cartItem
                    )
                );
            }
        } catch (error) {
            console.error(
                "Increase quantity error:",
                error
            );
            setCart((currentCart) =>
                currentCart.map((cartItem) =>
                    cartItem.cartItemId === cartItemId
                        ? { ...cartItem, quantity: item.quantity }
                        : cartItem
                )
            );
        } finally {
            setUpdatingItemIds((current) => {
                const next = new Set(current);
                next.delete(cartItemId);
                return next;
            });
        }
    };

    /* =========================================================
       DECREASE QUANTITY
    ========================================================= */

    const decreaseQuantity = async (
        cartItemId: number
    ) => {
        if (updatingItemIds.has(cartItemId)) {
            return;
        }

        const item = cart.find(
            (cartItem) =>
                cartItem.cartItemId === cartItemId
        );

        if (!item) {
            return;
        }

        const newQuantity = item.quantity - 1;
        if (newQuantity <= 0) {
            await removeFromCart(cartItemId);
            return;
        }

        setUpdatingItemIds((current) => new Set(current).add(cartItemId));
        setCart((currentCart) =>
            currentCart.map((cartItem) =>
                cartItem.cartItemId === cartItemId
                    ? { ...cartItem, quantity: newQuantity }
                    : cartItem
            )
        );

        try {
            const { error } = await supabase
                .from("cart_items")
                .update({ quantity: newQuantity })
                .eq("id", cartItemId);

            if (error) {
                console.error("Unable to decrease quantity:", error);
                setCart((currentCart) =>
                    currentCart.map((cartItem) =>
                        cartItem.cartItemId === cartItemId
                            ? { ...cartItem, quantity: item.quantity }
                            : cartItem
                    )
                );
            }
        } catch (error) {
            console.error("Decrease quantity error:", error);
            setCart((currentCart) =>
                currentCart.map((cartItem) =>
                    cartItem.cartItemId === cartItemId
                        ? { ...cartItem, quantity: item.quantity }
                        : cartItem
                )
            );
        } finally {
            setUpdatingItemIds((current) => {
                const next = new Set(current);
                next.delete(cartItemId);
                return next;
            });
        }
    };

    /* =========================================================
       REMOVE PRODUCT
    ========================================================= */

    const removeFromCart = async (
        cartItemId: number
    ) => {
        if (updatingItemIds.has(cartItemId)) {
            return;
        }

        const item = cart.find(
            (cartItem) =>
                cartItem.cartItemId === cartItemId
        );

        if (!item) {
            return;
        }

        setUpdatingItemIds((current) => new Set(current).add(cartItemId));
        setCart((currentCart) =>
            currentCart.filter(
                (cartItem) => cartItem.cartItemId !== cartItemId
            )
        );

        try {
            const { error } =
                await supabase
                    .from("cart_items")
                    .delete()
                    .eq("id", cartItemId);

            if (error) {
                console.error(
                    "Unable to remove cart item:",
                    error
                );
                setCart((currentCart) => [...currentCart, item]);
            }
        } catch (error) {
            console.error(
                "Remove cart item error:",
                error
            );
            setCart((currentCart) => [...currentCart, item]);
        } finally {
            setUpdatingItemIds((current) => {
                const next = new Set(current);
                next.delete(cartItemId);
                return next;
            });
        }
    };

    /* =========================================================
       CLEAR CART
    ========================================================= */

    const clearCart = async () => {
        try {
            const {
                data: { user },
            } = await supabase.auth.getUser();

            if (!user) {
                setCart([]);
                return;
            }

            const { error } =
                await supabase
                    .from("cart_items")
                    .delete()
                    .eq("user_id", user.id);

            if (error) {
                console.error(
                    "Unable to clear cart:",
                    error
                );

                return;
            }

            setCart([]);

        } catch (error) {
            console.error(
                "Clear cart error:",
                error
            );
        }
    };

    /* =========================================================
       TOTAL ITEMS
    ========================================================= */

    const totalItems =
        cart.reduce(
            (total, item) =>
                total + item.quantity,
            0
        );

    /* =========================================================
       SUBTOTAL
    ========================================================= */

    const subtotal =
        cart.reduce(
            (total, item) =>
                total +
                Number(item.price) *
                    item.quantity,
            0
        );

    /* =========================================================
       SHIPPING
    ========================================================= */

    const freeShippingThreshold =
        1999;

    const shipping =
        subtotal === 0
            ? 0
            : subtotal >=
              freeShippingThreshold
                ? 0
                : 99;

    /* =========================================================
       TOTAL
    ========================================================= */

    const total =
        subtotal + shipping;

    /* =========================================================
       SHIPPING PROGRESS
    ========================================================= */

    const shippingProgress =
        Math.min(
            (subtotal /
                freeShippingThreshold) *
                100,
            100
        );

    const amountRemaining =
        Math.max(
            freeShippingThreshold -
                subtotal,
            0
        );

    /* =========================================================
       LOADING
    ========================================================= */

    if (loading) {
        return (
            <div className="cart-page">
                <Navbar />

                <main className="cart-container">

                    <section className="cart-header">

                        <div className="cart-header-label">

                            <span className="header-line"></span>

                            <span>
                                YOUR SELECTION
                            </span>

                        </div>

                        <h1>
                            Shopping <em>Bag</em>
                        </h1>

                        <p>
                            Loading your selection...
                        </p>

                    </section>

                </main>

                <Footer />
            </div>
        );
    }

    return (
        <div className="cart-page">

            {/* =================================================
                SHARED KEIAN NAVBAR
            ================================================= */}

            <Navbar />


            {/* =================================================
                MAIN
            ================================================= */}

            <main className="cart-container">

                {/* =================================================
                    HEADER
                ================================================= */}

                <section className="cart-header">

                    <div className="cart-header-label">

                        <span className="header-line"></span>

                        <span>
                            YOUR SELECTION
                        </span>

                    </div>

                    <h1>
                        Shopping <em>Bag</em>
                    </h1>

                    <p>
                        {totalItems === 0
                            ? "Your selection is currently empty."
                            : `${totalItems} ${
                                totalItems === 1
                                    ? "piece"
                                    : "pieces"
                            } selected`}
                    </p>

                </section>


                {/* =================================================
                    EMPTY CART
                ================================================= */}

                {cart.length === 0 && (

                    <section className="empty-cart">

                        <div className="empty-cart-index">
                            01
                        </div>

                        <div className="empty-cart-content">

                            <span>
                                YOUR BAG IS EMPTY
                            </span>

                            <h2>
                                Begin with a
                                <em>
                                    {" "}fragrance.
                                </em>
                            </h2>

                            <p>
                                Explore the KEIAN collection
                                and find a scent that feels
                                distinctly yours.
                            </p>

                            <Link
                                to="/products"
                                className="empty-cart-link"
                            >

                                <span>
                                    Explore fragrances
                                </span>

                                <strong>
                                    →
                                </strong>

                            </Link>

                        </div>

                    </section>

                )}


                {/* =================================================
                    CART
                ================================================= */}

                {cart.length > 0 && (

                    <div className="cart-layout">

                        {/* =================================================
                            PRODUCTS
                        ================================================= */}

                        <section className="cart-products">

                            <div className="cart-products-heading">

                                <div>

                                    <span>
                                        YOUR FRAGRANCES
                                    </span>

                                    <strong>
                                        {totalItems}{" "}
                                        {totalItems === 1
                                            ? "piece"
                                            : "pieces"}
                                    </strong>

                                </div>

                                <button
                                    type="button"
                                    onClick={
                                        clearCart
                                    }
                                    className="clear-bag-button"
                                >
                                    Clear bag
                                </button>

                            </div>


                            {/* =================================================
                                PRODUCT ITEMS
                            ================================================= */}

                            <div className="cart-items">
                                {cart.map((item) => (
                                    <CartLineItem
                                        key={item.cartItemId}
                                        item={item}
                                        onViewProduct={(productId) =>
                                            navigate(`/products/${productId}`)
                                        }
                                        onDecrease={decreaseQuantity}
                                        onIncrease={increaseQuantity}
                                        onRemove={removeFromCart}
                                        isUpdating={updatingItemIds.has(item.cartItemId)}
                                    />
                                ))}
                            </div>


                            {/* =================================================
                                CONTINUE SHOPPING
                            ================================================= */}

                            <div className="cart-continue-row">

                                <Link
                                    to="/products"
                                    className="continue-shopping"
                                >

                                    <span>
                                        ←
                                    </span>

                                    Continue shopping

                                </Link>

                            </div>

                        </section>


                        {/* =================================================
                            ORDER SUMMARY
                        ================================================= */}

                        <CartOrderSummary
                            subtotal={subtotal}
                            shipping={shipping}
                            total={total}
                            amountRemaining={amountRemaining}
                            shippingProgress={shippingProgress}
                            onCheckout={() => navigate("/checkout")}
                        />

                    </div>

                )}


                {/* =================================================
                    BRAND NOTE
                ================================================= */}

                {cart.length > 0 && (

                    <section className="cart-brand-note">

                        <div className="brand-note-mark">
                            K
                        </div>

                        <div className="brand-note-line"></div>

                        <p>
                            Fragrance, considered
                            from first note to final detail.
                        </p>

                    </section>

                )}

            </main>


            {/* =================================================
                SHARED KEIAN FOOTER
            ================================================= */}

            <Footer />

        </div>
    );
}

export default Cart;
