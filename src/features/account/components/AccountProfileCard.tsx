export interface AccountProfile {
  full_name: string;
  email: string;
  phone: string;
}

interface AccountProfileCardProps {
  profile: AccountProfile;
  message: string;
  error: string;
  saving: boolean;
  onChange: (field: keyof AccountProfile, value: string) => void;
  onSave: () => void;
}

export function AccountProfileCard({
  profile,
  message,
  error,
  saving,
  onChange,
  onSave,
}: AccountProfileCardProps) {
  return (
    <div className="account-card">
      <div className="account-card-header">
        <h2>Personal Information</h2>
        <p>
          Update your details associated with your KEIAN account.
        </p>
      </div>

      <div className="account-form">
        <div className="account-field">
          <label htmlFor="full_name">NAME</label>
          <input
            id="full_name"
            type="text"
            value={profile.full_name}
            onChange={(event) =>
              onChange("full_name", event.target.value)
            }
            placeholder="Enter your name"
          />
        </div>

        <div className="account-field">
          <label htmlFor="email">EMAIL</label>
          <input id="email" type="email" value={profile.email} disabled />
          <small>Email is linked to your login account.</small>
        </div>

        <div className="account-field">
          <label htmlFor="phone">PHONE</label>
          <input
            id="phone"
            type="tel"
            value={profile.phone}
            maxLength={10}
            onChange={(event) =>
              onChange(
                "phone",
                event.target.value.replace(/\D/g, "").slice(0, 10)
              )
            }
            placeholder="Enter your 10-digit phone number"
          />
        </div>

        {message && <div className="account-success">{message}</div>}
        {error && <div className="account-error">{error}</div>}

        <button
          type="button"
          className="account-save-btn"
          onClick={onSave}
          disabled={saving}
        >
          {saving ? "SAVING..." : "SAVE CHANGES"}
        </button>
      </div>
    </div>
  );
}
