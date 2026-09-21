import { useState } from "react";
import "./ContactPage.css";
import {
  FaInstagram,
  FaFacebookF,
  FaPinterestP,
  FaEnvelope,
  FaPhone,
  FaMapMarkerAlt,
} from "react-icons/fa";

function ContactPage() {
  const [submitted, setSubmitted] =
    useState(false);

  const handleSubmit = (
    event: React.FormEvent<HTMLFormElement>
  ) => {
    event.preventDefault();

    setSubmitted(true);

    event.currentTarget.reset();
  };

  return (
    <div className="contact-page">

      {/* =====================================================
          CONTACT HERO
      ===================================================== */}

      <section className="contact-hero">

        <div className="contact-hero-content">

          <span className="section-label">
            GET IN TOUCH
          </span>

          <h1>
            We'd Love To{" "}
            <em>
              Hear From You.
            </em>
          </h1>

          <p>
            Whether you have a question about our
            fragrances, your order, or simply want
            to know more about KEIAN, we're here
            to help.
          </p>

        </div>

      </section>

      {/* =====================================================
          CONTACT SECTION
      ===================================================== */}

      <section className="contact-section">

        <div className="contact-container">

          {/* =================================================
              CONTACT INFORMATION
          ================================================= */}

          <div className="contact-info">

            <span className="section-label">
              CONTACT KEIAN
            </span>

            <h2>
              Let's Start a{" "}
              <em>
                Conversation.
              </em>
            </h2>

            <p className="contact-intro">
              Have a question, suggestion, or need
              assistance? Send us a message and our
              team will get back to you as soon as
              possible.
            </p>

            {/* LOCATION */}

            <div className="contact-info-item">

              <div className="contact-icon">
                <FaMapMarkerAlt />
              </div>

              <div>

                <h4>
                  VISIT US
                </h4>

                <p>
                  KEIAN Fragrances
                  <br />
                  Pune, Maharashtra
                  <br />
                  India
                </p>

              </div>

            </div>

            {/* EMAIL */}

            <div className="contact-info-item">

              <div className="contact-icon">
                <FaEnvelope />
              </div>

              <div>

                <h4>
                  EMAIL US
                </h4>

                <a href="mailto:info@keian.com">
                  info@keian.com
                </a>

              </div>

            </div>

            {/* PHONE */}

            <div className="contact-info-item">

              <div className="contact-icon">
                <FaPhone />
              </div>

              <div>

                <h4>
                  CALL US
                </h4>

                <a href="tel:+919999999999">
                  +91 99999 99999
                </a>

              </div>

            </div>

            {/* SOCIAL MEDIA */}

            <div className="contact-social">

              <h4>
                FOLLOW KEIAN
              </h4>

              <div className="contact-social-links">

                <a
                  href="#instagram"
                  aria-label="Instagram"
                >
                  <FaInstagram />
                </a>

                <a
                  href="#facebook"
                  aria-label="Facebook"
                >
                  <FaFacebookF />
                </a>

                <a
                  href="#pinterest"
                  aria-label="Pinterest"
                >
                  <FaPinterestP />
                </a>

              </div>

            </div>

          </div>

          {/* =================================================
              CONTACT FORM
          ================================================= */}

          <div className="contact-form-wrapper">

            <div className="contact-form-header">

              <span>
                SEND US A MESSAGE
              </span>

              <h3>
                How Can We Help?
              </h3>

            </div>

            {/* SUCCESS MESSAGE */}

            {submitted && (
              <div className="contact-success">
                Thank you for contacting KEIAN.
                We will get back to you soon.
              </div>
            )}

            <form
              className="contact-form"
              onSubmit={handleSubmit}
            >

              {/* NAME + EMAIL */}

              <div className="contact-form-row">

                <div className="form-group">

                  <label htmlFor="contact-name">
                    FULL NAME
                  </label>

                  <input
                    id="contact-name"
                    type="text"
                    name="name"
                    placeholder="Your name"
                    autoComplete="name"
                    required
                  />

                </div>

                <div className="form-group">

                  <label htmlFor="contact-email">
                    EMAIL ADDRESS
                  </label>

                  <input
                    id="contact-email"
                    type="email"
                    name="email"
                    placeholder="Your email"
                    autoComplete="email"
                    required
                  />

                </div>

              </div>

              {/* PHONE + SUBJECT */}

              <div className="contact-form-row">

                <div className="form-group">

                  <label htmlFor="contact-phone">
                    PHONE NUMBER
                  </label>

                  <input
                    id="contact-phone"
                    type="tel"
                    name="phone"
                    placeholder="+91 XXXXX XXXXX"
                    autoComplete="tel"
                  />

                </div>

                <div className="form-group">

                  <label htmlFor="contact-subject">
                    SUBJECT
                  </label>

                  <select
                    id="contact-subject"
                    name="subject"
                    defaultValue=""
                    required
                  >

                    <option
                      value=""
                      disabled
                    >
                      Select a subject
                    </option>

                    <option value="order">
                      Order Enquiry
                    </option>

                    <option value="product">
                      Product Enquiry
                    </option>

                    <option value="shipping">
                      Shipping & Delivery
                    </option>

                    <option value="return">
                      Returns & Exchange
                    </option>

                    <option value="general">
                      General Enquiry
                    </option>

                  </select>

                </div>

              </div>

              {/* MESSAGE */}

              <div className="form-group">

                <label htmlFor="contact-message">
                  YOUR MESSAGE
                </label>

                <textarea
                  id="contact-message"
                  name="message"
                  rows={6}
                  placeholder="Tell us how we can help..."
                  required
                ></textarea>

              </div>

              {/* SUBMIT BUTTON */}

              <button
                type="submit"
                className="contact-submit"
              >
                SEND MESSAGE

                <span>
                  →
                </span>

              </button>

            </form>

          </div>

        </div>

      </section>

      {/* =====================================================
          BOTTOM SECTION
      ===================================================== */}

      <section className="contact-bottom">

        <span className="section-label">
          THE KEIAN EXPERIENCE
        </span>

        <h2>
          Your Scent.
          <br />
          <em>
            Your Story.
          </em>
        </h2>

        <p>
          Every conversation helps us create a
          better fragrance experience for you.
        </p>

      </section>

    </div>
  );
}

export default ContactPage;