import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { FaShoppingBag, FaInstagram, FaFacebookF, FaPinterestP, FaEnvelope, FaPhone, FaMapMarkerAlt } from "react-icons/fa";
import logo1 from "@/assets/images/logo.webp";
import logofooter from "@/assets/images/logo001.webp";
import { supabase } from "@/shared/lib/supabaseClient";
import "@/styles/storefront.css";

/* =========================================================
   NAVBAR
========================================================= */

export function Navbar() {
  const [isScrolled, setIsScrolled] =
    useState(false);

  const [user, setUser] =
    useState<any>(null);

  const [accountOpen, setAccountOpen] =
    useState(false);

  const [loggingOut, setLoggingOut] =
    useState(false);

  const navigate = useNavigate();

  const isHomePage =
    window.location.pathname === "/";

  /* =====================================================
     CHECK AUTHENTICATION
  ===================================================== */

  useEffect(() => {
    const getCurrentUser = async () => {
      const {
        data: { user },
      } = await supabase.auth.getUser();

      setUser(user);
    };

    getCurrentUser();

    /* ===================================================
       LISTEN FOR LOGIN / LOGOUT
    =================================================== */

    const {
      data: { subscription },
    } = supabase.auth.onAuthStateChange(
      (_event, session) => {
        setUser(session?.user ?? null);

        if (!session?.user) {
          setAccountOpen(false);
        }
      }
    );

    return () => {
      subscription.unsubscribe();
    };
  }, []);

  /* =====================================================
     NAVBAR SCROLL
  ===================================================== */

  useEffect(() => {
    if (!isHomePage) {
      setIsScrolled(true);
      return;
    }

    const handleScroll = () => {
      setIsScrolled(window.scrollY > 20);
    };

    handleScroll();

    window.addEventListener(
      "scroll",
      handleScroll
    );

    return () => {
      window.removeEventListener(
        "scroll",
        handleScroll
      );
    };
  }, [isHomePage]);

  /* =====================================================
     CLOSE ACCOUNT DROPDOWN WHEN CLICKING OUTSIDE
  ===================================================== */

  useEffect(() => {
    const handleClickOutside = (
      event: MouseEvent
    ) => {
      const target =
        event.target as HTMLElement;

      if (
        !target.closest(".account-menu")
      ) {
        setAccountOpen(false);
      }
    };

    document.addEventListener(
      "mousedown",
      handleClickOutside
    );

    return () => {
      document.removeEventListener(
        "mousedown",
        handleClickOutside
      );
    };
  }, []);

  /* =====================================================
     SECTION NAVIGATION
  ===================================================== */

  const handleSectionNavigation = (
    event: React.MouseEvent<HTMLAnchorElement>,
    sectionId: string
  ) => {
    event.preventDefault();

    if (window.location.pathname === "/") {
      document
        .getElementById(sectionId)
        ?.scrollIntoView({
          behavior: "smooth",
          block: "start",
        });

      window.history.replaceState(
        null,
        "",
        `/#${sectionId}`
      );

      return;
    }

    sessionStorage.setItem(
      "scrollTarget",
      sectionId
    );

    navigate("/");
  };

  /* =====================================================
     LOGOUT
  ===================================================== */

  const handleLogout = async () => {
    setLoggingOut(true);

    try {
      const { error } =
        await supabase.auth.signOut();

      if (error) {
        console.error(
          "Logout error:",
          error
        );

        return;
      }

      setUser(null);
      setAccountOpen(false);

      navigate("/");
    } catch (error) {
      console.error(
        "Logout error:",
        error
      );
    } finally {
      setLoggingOut(false);
    }
  };

  return (
    <header
      className={`navbar site-navbar ${
        isScrolled ? "scrolled" : ""
      }`}
    >
      {/* =================================================
          LOGO
      ================================================= */}

      <div className="nav-top-row">
        <a
          href="/"
          className="logo"
          aria-label="Keian home"
        >
          <img
            src={logo1}
            alt="Keian Logo"
            width="160"
            height="94"
          />
        </a>
      </div>

      <span className="logo-text">
        KEIAN
      </span>

      {/* =================================================
          NAVIGATION
      ================================================= */}

      <nav
        className="nav-links"
        aria-label="Main navigation"
      >
        <a href="/">
          Home
        </a>

        <a href="/products">
          Shop
        </a>

        <a
          href="/collections"
          onClick={(event) =>
            handleSectionNavigation(
              event,
              "collections"
            )
          }
        >
          Collections
        </a>

        <a
          href="/#about"
          onClick={(event) =>
            handleSectionNavigation(
              event,
              "about"
            )
          }
        >
          Our Story
        </a>
      </nav>

      {/* =================================================
          NAV ACTIONS
      ================================================= */}

      <div className="nav-actions">

        {/* =================================================
            LOGGED OUT
        ================================================= */}

        {!user && (
          <>
            {/* LOGIN */}

            <button
              type="button"
              className="nav-auth-button nav-login-button"
              onClick={() => {
                navigate("/login");
              }}
            >
              LOGIN
            </button>

            {/* REGISTER */}

            <button
              type="button"
              className="nav-auth-button nav-register-button"
              onClick={() => {
                navigate("/register");
              }}
            >
              REGISTER
            </button>
          </>
        )}

        {/* =================================================
            LOGGED IN ACCOUNT
        ================================================= */}

        {user && (
          <div className="account-menu">

            {/* ACCOUNT BUTTON */}

            <button
              type="button"
              className="nav-auth-button account-button"
              onClick={() =>
                setAccountOpen(
                  (current) => !current
                )
              }
              aria-expanded={accountOpen}
              aria-haspopup="true"
            >
              ACCOUNT

              <span
                className={`account-arrow ${
                  accountOpen
                    ? "open"
                    : ""
                }`}
              >
                ↓
              </span>
            </button>

            {/* ACCOUNT DROPDOWN */}

            {accountOpen && (
              <div className="account-dropdown">

                {/* MY ACCOUNT */}

                <button
                  type="button"
                  onClick={() => {
                    setAccountOpen(false);
                    navigate("/account");
                  }}
                >
                  <span>
                    MY ACCOUNT
                  </span>

                  <span>
                    →
                  </span>
                </button>

                {/* MY ORDERS */}

                <button
                  type="button"
                  onClick={() => {
                    setAccountOpen(false);
                    navigate("/orders");
                  }}
                >
                  <span>
                    MY ORDERS
                  </span>

                  <span>
                    →
                  </span>
                </button>

                {/* DIVIDER */}

                <div className="account-dropdown-divider"></div>

                {/* LOGOUT */}

                <button
                  type="button"
                  className="logout-dropdown-button"
                  onClick={handleLogout}
                  disabled={loggingOut}
                >
                  <span>
                    {loggingOut
                      ? "LOGGING OUT..."
                      : "LOGOUT"}
                  </span>

                  <span>
                    →
                  </span>
                </button>

              </div>
            )}

          </div>
        )}

        {/* =================================================
            SHOPPING BAG
        ================================================= */}

        <button
          type="button"
          className="nav-bag-button"
          aria-label="Shopping bag"
          onClick={() => {
            navigate("/cart");
          }}
        >
          <FaShoppingBag />
        </button>

      </div>
    </header>
  );
}

/* =========================================================
   FOOTER
========================================================= */

export function Footer() {
  return (
    <footer className="footer site-footer">

      <div className="footer-top">

        {/* BRAND */}

        <div className="footer-brand">

          <div className="footer-logo">

            <img
              src={logofooter}
              alt="KEIAN"
              width="160"
              height="154"
              loading="lazy"
              decoding="async"
            />

          </div>

          <p>
            The art of fragrance,

            <br />

            captured in a bottle.
          </p>

        </div>

        {/* SHOP */}

        <div className="footer-column">

          <h4>
            SHOP
          </h4>

          <a href="/products">
            All Fragrances
          </a>

          <a href="/products/attars">
            Attars
          </a>

          <a href="/products/gift-sets">
            Gift Sets
          </a>

          <a href="/products/him">
            For Him
          </a>

          <a href="/products/her">
            For Her
          </a>

          <a href="/products/unisex">
            Unisex
          </a>

          <a href="/products/oud">
            Oud
          </a>

          <a href="/products/bakhoor">
            Dhakoon
          </a>

        </div>

        {/* ABOUT */}

        <div className="footer-column">

          <h4>
            ABOUT
          </h4>

          <a href="/our-story">
            Our Philosophy
          </a>

          <a href="/contact">
            Contact
          </a>

        </div>

        {/* FOLLOW */}

        <div className="footer-column footer-social">

          <h4>
            FOLLOW
          </h4>

          <a
            href="#instagram"
            aria-label="Instagram"
          >
            <FaInstagram />

            <span>
              Instagram
            </span>

          </a>

          <a
            href="#facebook"
            aria-label="Facebook"
          >
            <FaFacebookF />

            <span>
              Facebook
            </span>

          </a>

          <a
            href="#pinterest"
            aria-label="Pinterest"
          >
            <FaPinterestP />

            <span>
              Pinterest
            </span>

          </a>

        </div>

        {/* CONTACT */}

        <div className="footer-column footer-contact">

          <h4>
            CONTACT
          </h4>

          <div className="contact-item">

            <FaMapMarkerAlt />

            <span>
              KEIAN Fragrances

              <br />

              Pune, Maharashtra

              <br />

              India
            </span>

          </div>

          <a
            href="mailto:info@keian.com"
            className="contact-item"
          >

            <FaEnvelope />

            <span>
              info@keian.com
            </span>

          </a>

          <a
            href="tel:+919898552297"
            className="contact-item"
          >

            <FaPhone />

            <span>
              +91 9898552297
            </span>

          </a>

        </div>

      </div>

      {/* FOOTER BOTTOM */}

      <div className="footer-bottom">

        <span>
          © 2026 KEIAN. ALL RIGHTS RESERVED.
        </span>

        <span>
          PRIVACY · TERMS · SHIPPING
        </span>

      </div>

    </footer>
  );
}
