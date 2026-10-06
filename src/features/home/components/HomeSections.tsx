import storyImage from "@/assets/images/optimized/story2.webp";

interface HomeCollectionsProps {
  perfumeImage: string;
  attarImage: string;
  giftImage: string;
  bakhoorImage: string;
}

const collections = [
  {
    href: "/products/perfumes",
    className: "category-perfumes",
    imageKey: "perfumeImage",
    width: 919,
    height: 804,
    alt: "Perfumes",
    title: "Perfumes",
    description: "Elegant · Timeless · Refined →",
  },
  {
    href: "/products/attars",
    className: "category-attars",
    imageKey: "attarImage",
    width: 1024,
    height: 826,
    alt: "Attars",
    title: "Attars",
    description: "Traditional · Rich · Fragrant →",
  },
  {
    href: "/products/gift-sets",
    className: "category-giftsets",
    imageKey: "giftImage",
    width: 1024,
    height: 1024,
    alt: "Gift Sets",
    title: "Gift Sets",
    description: "Luxury · Thoughtful · Special →",
  },
  {
    href: "/products/bakhoor",
    className: "category-dhakoon",
    imageKey: "bakhoorImage",
    width: 1024,
    height: 1024,
    alt: "Dhakoon",
    title: "Dhakoon",
    description: "Smoky · Aromatic · Luxurious →",
  },
] as const;

export function TrustBar() {
  return (
    <section className="trust-bar">
      <div>
        <span>✦</span>
        <strong>LONG LASTING</strong>
        <small>Up to 12 hours</small>
      </div>
      <div>
        <span>✧</span>
        <strong>PREMIUM QUALITY</strong>
        <small>Finest ingredients</small>
      </div>
      <div>
        <span>◇</span>
        <strong>FREE SHIPPING</strong>
        <small>On orders above ₹1,999</small>
      </div>
      <div>
        <span>✦</span>
        <strong>CRAFTED WITH CARE</strong>
        <small>Made for you</small>
      </div>
    </section>
  );
}

export function HomeCollections({
  perfumeImage,
  attarImage,
  giftImage,
  bakhoorImage,
}: HomeCollectionsProps) {
  const images = {
    perfumeImage,
    attarImage,
    giftImage,
    bakhoorImage,
  };

  return (
    <section className="section categories" id="collections">
      <div className="section-header">
        <div>
          <span className="section-label">EXPLORE</span>
          <h2>
            Discover Our <em>Collections</em>
          </h2>
        </div>
        <p>
          Explore our finest fragrances, traditional attars, luxurious gift
          sets and aromatic dhakoon.
        </p>
      </div>

      <div className="category-grid">
        {collections.map((collection) => (
          <a
            key={collection.href}
            href={collection.href}
            className={`category-card collection-card ${collection.className}`}
          >
            <img
              src={images[collection.imageKey]}
              alt={collection.alt}
              className="collection-image"
              width={collection.width}
              height={collection.height}
              loading="lazy"
              decoding="async"
            />
            <div className="category-overlay">
              <span>DISCOVER</span>
              <h3>{collection.title}</h3>
              <p>{collection.description}</p>
            </div>
          </a>
        ))}
      </div>
    </section>
  );
}

export function HomeStory() {
  return (
    <section className="story" id="about">
      <div className="story-image">
        <img
          src={storyImage}
          alt="Keian luxury perfume bottle"
          width="1024"
          height="576"
          loading="lazy"
          decoding="async"
        />
        <div className="story-overlay"></div>
      </div>

      <div className="story-content">
        <span className="section-label">OUR PHILOSOPHY</span>
        <h2>
          More Than
          <br />
          <em>A Fragrance.</em>
        </h2>
        <div className="gold-line"></div>
        <p>
          We believe a fragrance is more than a scent. It is a memory, an
          emotion, a feeling that stays long after you&apos;ve left the room.
        </p>
        <p>
          Every Keian creation is carefully composed using exceptional
          ingredients to create something truly unforgettable.
        </p>
        <a href="/our-story" className="text-link">
          OUR STORY <span>→</span>
        </a>
      </div>
    </section>
  );
}

export function NewsletterSection() {
  return (
    <section className="newsletter">
      <span className="section-label">JOIN THE WORLD OF KEIAN</span>
      <h2>
        Your next signature
        <br />
        <em>is waiting.</em>
      </h2>
      <p>
        Subscribe for exclusive launches, fragrance stories, and special
        offers.
      </p>
      <form
        className="newsletter-form"
        onSubmit={(event) => {
          event.preventDefault();
          alert("Thank you for subscribing to Keian.");
        }}
      >
        <input
          type="email"
          placeholder="Your email address"
          aria-label="Email address"
          required
        />
        <button type="submit">
          SUBSCRIBE <span>→</span>
        </button>
      </form>
    </section>
  );
}
