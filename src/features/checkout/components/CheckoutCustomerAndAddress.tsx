import type { ChangeEvent } from "react";

export interface CheckoutCustomer {
  name: string;
  email: string;
  phone: string;
  address: string;
  city: string;
  state: string;
  pincode: string;
}

interface CheckoutCustomerAndAddressProps {
  customer: CheckoutCustomer;
  onChange: (
    event: ChangeEvent<HTMLInputElement | HTMLTextAreaElement>
  ) => void;
}

export function CheckoutCustomerAndAddress({
  customer,
  onChange,
}: CheckoutCustomerAndAddressProps) {
  return (
    <>
      <section className="checkout-card">
        <div className="checkout-section-title">
          <span>01</span>
          <div>
            <h2>Customer Information</h2>
            <p>Enter your contact details.</p>
          </div>
        </div>

        <div className="checkout-form-grid">
          <div className="checkout-field full">
            <label>Full Name</label>
            <input
              type="text"
              name="name"
              value={customer.name}
              onChange={onChange}
              placeholder="Enter your full name"
              autoComplete="name"
            />
          </div>

          <div className="checkout-field">
            <label>Email Address</label>
            <input
              type="email"
              name="email"
              value={customer.email}
              onChange={onChange}
              placeholder="you@example.com"
              autoComplete="email"
            />
          </div>

          <div className="checkout-field">
            <label>Phone Number</label>
            <input
              type="tel"
              name="phone"
              value={customer.phone}
              onChange={onChange}
              placeholder="10-digit mobile number"
              maxLength={10}
              autoComplete="tel"
            />
          </div>
        </div>
      </section>

      <section className="checkout-card">
        <div className="checkout-section-title">
          <span>02</span>
          <div>
            <h2>Shipping Address</h2>
            <p>Where should we deliver your fragrance?</p>
          </div>
        </div>

        <div className="checkout-form-grid">
          <div className="checkout-field full">
            <label>Address</label>
            <textarea
              name="address"
              value={customer.address}
              onChange={onChange}
              placeholder="House / Flat / Street / Area"
              rows={4}
              autoComplete="street-address"
            />
          </div>

          <div className="checkout-field">
            <label>City</label>
            <input
              type="text"
              name="city"
              value={customer.city}
              onChange={onChange}
              placeholder="City"
              autoComplete="address-level2"
            />
          </div>

          <div className="checkout-field">
            <label>State</label>
            <input
              type="text"
              name="state"
              value={customer.state}
              onChange={onChange}
              placeholder="State"
              autoComplete="address-level1"
            />
          </div>

          <div className="checkout-field">
            <label>Pincode</label>
            <input
              type="text"
              name="pincode"
              value={customer.pincode}
              onChange={onChange}
              placeholder="6-digit pincode"
              maxLength={6}
              autoComplete="postal-code"
            />
          </div>
        </div>
      </section>
    </>
  );
}
