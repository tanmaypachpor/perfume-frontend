import { useState } from "react";
import "@/features/content/pages/ContactPage.css";
import { supabase } from "@/shared/lib/supabaseClient";

import {
  FaInstagram,
  FaFacebookF,
  FaPinterestP,
  FaEnvelope,
  FaPhone,
  FaArrowRight,
  FaCheck,
} from "react-icons/fa";

function ContactPage() {
  const [submitted, setSubmitted] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [submitError, setSubmitError] = useState("");

  const handleSubmit = async (
    event: React.FormEvent<HTMLFormElement>
  ) => {
    event.preventDefault();

    const form = event.currentTarget;
    const formData = new FormData(form);

    const message = {
      name: String(formData.get("name") ?? ""),
      email: String(formData.get("email") ?? ""),
      phone: String(formData.get("phone") ?? ""),
      subject: String(formData.get("subject") ?? ""),
      message: String(formData.get("message") ?? ""),
    };

    setSubmitting(true);
    setSubmitted(false);
    setSubmitError("");

    try {
      const { error } = await supabase.functions.invoke(
        "contact-email",
        {
          body: message,
        }
      );

      if (error) {
        console.error(
          "Contact form submission failed:",
          error.message
        );

        setSubmitError(
          "We couldn't send your message. Please try again."
        );

        return;
      }

      setSubmitted(true);
      form.reset();
    } catch (error) {
      console.error(
        "Contact form request failed:",
        error
      );

      setSubmitError(
        "We couldn't send your message. Please check your connection and try again."
      );
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <main className="contact-page">

      {/* HEADER */}
      <section className="contact-header">
        <span className="section-label">
          CONTACT KEIAN
        </span>

        <h1>
          We'd love to
          <em>hear from you.</em>
        </h1>

        <p>
          Have a question about a fragrance, your order,
          delivery, or anything else? Send us a message
          and our team will get back to you.
        </p>
      </section>

      {/* CONTACT INFO */}
      <div className="contact-quick-info">

        <a href="mailto:info@keian.com">
          <FaEnvelope />
          <span>info@keian.com</span>
        </a>

        <a href="tel:+919898552297">
          <FaPhone />
          <span>+91 9898552297</span>
        </a>

      </div>

      {/* FORM */}
      <section className="contact-form-section">

        <div className="contact-form-wrapper">

          <div className="form-header">
            <div>
              <span className="form-eyebrow">
                WRITE TO US
              </span>

              <h2>
                How can we
                <em>help?</em>
              </h2>
            </div>

            <span className="form-mark">
              K
            </span>
          </div>

          <p className="form-description">
            Fill in the details below and tell us
            what's on your mind.
          </p>

          {submitted && (
            <div
              className="contact-success"
              role="status"
            >
              <div className="success-icon">
                <FaCheck />
              </div>

              <div>
                <strong>
                  Message received.
                </strong>

                <p>
                  Thank you for contacting KEIAN.
                  We'll get back to you soon.
                </p>
              </div>
            </div>
          )}

          {submitError && (
            <div
              className="contact-error"
              role="alert"
            >
              {submitError}
            </div>
          )}

          <form
            className="contact-form"
            onSubmit={handleSubmit}
          >

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
                  <option value="" disabled>
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

            <div className="form-group">
              <label htmlFor="contact-message">
                YOUR MESSAGE
              </label>

              <textarea
                id="contact-message"
                name="message"
                rows={5}
                placeholder="Tell us how we can help..."
                required
              />
            </div>

            <div className="form-submit-area">

              <button
                type="submit"
                className="contact-submit"
                disabled={submitting}
              >
                <span>
                  {submitting
                    ? "SENDING..."
                    : "SEND MESSAGE"}
                </span>

                <FaArrowRight />
              </button>

              <p>
                Your message is sent securely
                to the KEIAN team.
              </p>

            </div>

          </form>
        </div>

      </section>

      {/* SOCIAL */}
      <footer className="contact-footer">

        <span>
          FOLLOW KEIAN
        </span>

        <div className="contact-social-links">

          <a href="#instagram" aria-label="Instagram">
            <FaInstagram />
          </a>

          <a href="#facebook" aria-label="Facebook">
            <FaFacebookF />
          </a>

          <a href="#pinterest" aria-label="Pinterest">
            <FaPinterestP />
          </a>

        </div>

      </footer>

    </main>
  );
}

export default ContactPage;


