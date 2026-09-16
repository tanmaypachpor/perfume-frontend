import { useNavigate } from "react-router-dom";
import "./OurStory.css";

function OurStory() {
  const navigate = useNavigate();

  return (
    <div className="story-page">

      {/* =========================
          NAVBAR
      ========================= */}

      <header className="story-navbar">

        <button
          type="button"
          className="story-logo"
          onClick={() => navigate("/")}
        >
          LUMIÈRE
        </button>

        <nav className="story-nav-links">

          <button
            type="button"
            onClick={() => navigate("/")}
          >
            Home
          </button>

          <button
            type="button"
            onClick={() => navigate("/products")}
          >
            Shop
          </button>

          <button
            type="button"
            onClick={() => navigate("/#collections")}
          >
            Collections
          </button>

          <button
            type="button"
            className="active"
          >
            Our Story
          </button>

        </nav>

        <div className="story-nav-actions">

          <button
            type="button"
            aria-label="Search"
          >
            ⌕
          </button>

          <button
            type="button"
            aria-label="Wishlist"
          >
            ♡
          </button>

          <button
            type="button"
            aria-label="Shopping bag"
            onClick={() => navigate("/cart")}
          >
            ♧
          </button>

        </div>

      </header>


      {/* =========================
          HERO
      ========================= */}

      <section className="story-hero">

        <div className="story-hero-overlay"></div>

        <div className="story-hero-content">

          <span className="story-label">
            THE LUMIÈRE STORY
          </span>

          <h1>
            Where Fragrance
            <br />
            Becomes <em>Identity</em>
          </h1>

          <p>
            A journey inspired by timeless perfumery,
            refined craftsmanship and the art of creating
            unforgettable memories.
          </p>

        </div>

        <div className="story-scroll">
          <span>SCROLL TO DISCOVER</span>
          <div className="scroll-line"></div>
        </div>

      </section>


      {/* =========================
          INTRODUCTION
      ========================= */}

      <section className="story-intro">

        <div className="story-intro-content">

          <span className="story-label">
            OUR BEGINNING
          </span>

          <h2>
            More Than A
            <br />
            <em>Fragrance</em>
          </h2>

          <p className="story-large-text">
            LUMIÈRE was created from a simple belief —
            fragrance should be more than a scent.
            It should become part of who you are.
          </p>

          <p>
            Every fragrance carries a story. A memory,
            a feeling, a place or a moment that stays
            with you long after the scent disappears.
            LUMIÈRE was born to create those moments.
          </p>

          <p>
            Inspired by the richness of traditional
            perfumery and combined with a contemporary
            vision, we create fragrances that feel
            timeless, refined and deeply personal.
          </p>

        </div>

      </section>


      {/* =========================
          PHILOSOPHY
      ========================= */}

      <section className="story-philosophy">

        <div className="story-section-heading">

          <span className="story-label">
            WHAT WE BELIEVE
          </span>

          <h2>
            Our <em>Philosophy</em>
          </h2>

          <p>
            Three principles guide everything we create.
          </p>

        </div>


        <div className="philosophy-grid">

          <div className="philosophy-card">

            <span className="philosophy-number">
              01
            </span>

            <div className="philosophy-icon">
              ✦
            </div>

            <h3>
              Crafted With
              <br />
              Intention
            </h3>

            <p>
              Every composition is carefully balanced
              to create a fragrance with character,
              depth and lasting impression.
            </p>

          </div>


          <div className="philosophy-card featured">

            <span className="philosophy-number">
              02
            </span>

            <div className="philosophy-icon">
              ◇
            </div>

            <h3>
              A Signature
              <br />
              For Everyone
            </h3>

            <p>
              From rich oud and warm amber to delicate
              florals and refined musk, every fragrance
              tells its own unique story.
            </p>

          </div>


          <div className="philosophy-card">

            <span className="philosophy-number">
              03
            </span>

            <div className="philosophy-icon">
              ∞
            </div>

            <h3>
              Timeless,
              <br />
              Not Trendy
            </h3>

            <p>
              We believe true elegance does not follow
              trends. It creates memories that remain.
            </p>

          </div>

        </div>

      </section>


      {/* =========================
          ART OF PERFUMERY
      ========================= */}

      <section className="art-section">

        <div className="art-image">

          <div className="art-image-content">

            <span>
              THE ART OF
            </span>

            <strong>
              PERFUMERY
            </strong>

          </div>

        </div>


        <div className="art-content">

          <span className="story-label">
            THE ART OF PERFUMERY
          </span>

          <h2>
            From A Single
            <br />
            <em>Note</em>
          </h2>

          <p className="art-lead">
            A fragrance begins with a single note,
            but becomes memorable through the harmony
            of many.
          </p>

          <p>
            At LUMIÈRE, we explore the relationship
            between traditional ingredients and modern
            fragrance design.
          </p>

          <p>
            Oud, amber, musk, rose, saffron and other
            carefully selected notes come together to
            create compositions that feel familiar yet
            distinctly their own.
          </p>

          <div className="art-signature">
            LUMIÈRE
          </div>

        </div>

      </section>


      {/* =========================
          SIGNATURE QUOTE
      ========================= */}

      <section className="story-quote">

        <div className="quote-mark">
          “
        </div>

        <blockquote>
          Wear a fragrance.
          <br />
          Leave a <em>memory.</em>
        </blockquote>

        <span>
          — LUMIÈRE
        </span>

      </section>


      {/* =========================
          BRAND VALUES
      ========================= */}

      <section className="values-section">

        <div className="story-section-heading">

          <span className="story-label">
            THE LUMIÈRE STANDARD
          </span>

          <h2>
            Designed To Be
            <br />
            <em>Remembered</em>
          </h2>

        </div>


        <div className="values-list">

          <div className="value-item">

            <span>01</span>

            <div>
              <h3>Character</h3>
              <p>
                Fragrances with depth, personality
                and a distinctive identity.
              </p>
            </div>

          </div>


          <div className="value-item">

            <span>02</span>

            <div>
              <h3>Elegance</h3>
              <p>
                Refined compositions created to feel
                sophisticated without being overwhelming.
              </p>
            </div>

          </div>


          <div className="value-item">

            <span>03</span>

            <div>
              <h3>Memory</h3>
              <p>
                Scents designed to become connected
                with the moments that matter.
              </p>
            </div>

          </div>

        </div>

      </section>


      {/* =========================
          CTA
      ========================= */}

      <section className="story-cta">

        <span className="story-label">
          DISCOVER YOUR SIGNATURE
        </span>

        <h2>
          Find The Fragrance
          <br />
          That Tells <em>Your Story</em>
        </h2>

        <p>
          Explore the LUMIÈRE collection and discover
          a scent that feels uniquely yours.
        </p>

        <button
          type="button"
          onClick={() => navigate("/products")}
        >
          EXPLORE THE COLLECTION
          <span>→</span>
        </button>

      </section>


      {/* =========================
          FOOTER
      ========================= */}

      <footer className="story-footer">

        <div className="story-footer-logo">
          LUMIÈRE
        </div>

        <p>
          Fragrance that becomes memory.
        </p>

        <div className="story-footer-links">

          <button
            type="button"
            onClick={() => navigate("/")}
          >
            Home
          </button>

          <button
            type="button"
            onClick={() => navigate("/products")}
          >
            Shop
          </button>

          <button
            type="button"
            onClick={() => navigate("/cart")}
          >
            Cart
          </button>

        </div>

        <div className="story-copyright">
          © 2026 LUMIÈRE. ALL RIGHTS RESERVED.
        </div>

      </footer>

    </div>
  );
}

export default OurStory;