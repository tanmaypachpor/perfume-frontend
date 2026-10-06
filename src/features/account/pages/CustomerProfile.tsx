import React, { useEffect, useState } from "react";
import { supabase } from "@/shared/lib/supabaseClient";

interface Profile {
  full_name: string;
  phone: string;
  address: string;
  city: string;
  state: string;
  pincode: string;
}

export default function CustomerProfile() {
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [message, setMessage] = useState("");
  const [profile, setProfile] = useState<Profile>({
    full_name: "",
    phone: "",
    address: "",
    city: "",
    state: "",
    pincode: "",
  });

  useEffect(() => {
    async function loadProfile() {
      const { data: { user } } = await supabase.auth.getUser();

      if (!user) {
        window.location.href = "/login";
        return;
      }

      const { data, error: profileError } = await supabase
        .from("profiles")
        .select("*")
        .eq("id", user.id)
        .single();

      if (profileError) {
        console.error("Profile load error:", profileError);
      }

      if (data) {
        setProfile({
          full_name: data.full_name || "",
          phone: data.phone || "",
          address: data.address || "",
          city: data.city || "",
          state: data.state || "",
          pincode: data.pincode || "",
        });
      }
      setLoading(false);
    }

    loadProfile();
  }, []);

  const handleUpdate = async (e: React.FormEvent) => {
    e.preventDefault();
    setSaving(true);
    setMessage("");

    const { data: { user } } = await supabase.auth.getUser();

    if (user) {
      const { error } = await supabase
        .from("profiles")
        .upsert({ id: user.id, ...profile, updated_at: new Date().toISOString() });

      if (error) {
        alert("Error updating profile: " + error.message);
      } else {
        setMessage("Profile and address updated successfully!");
      }
    }
    setSaving(false);
  };

  if (loading) return <div>Loading profile...</div>;

  return (
    <div style={{ maxWidth: "500px", margin: "40px auto", padding: "20px" }}>
      <h2>My Account Profile</h2>
      {message && <p style={{ color: "green" }}>{message}</p>}

      <form onSubmit={handleUpdate}>
        <div>
          <label>Full Name</label>
          <input
            type="text"
            value={profile.full_name}
            onChange={(e) => setProfile({ ...profile, full_name: e.target.value })}
            style={{ width: "100%", padding: "8px", marginBottom: "10px" }}
          />
        </div>
        <div>
          <label>Phone</label>
          <input
            type="tel"
            value={profile.phone}
            onChange={(e) => setProfile({ ...profile, phone: e.target.value })}
            style={{ width: "100%", padding: "8px", marginBottom: "10px" }}
          />
        </div>
        <div>
          <label>Street Address</label>
          <textarea
            value={profile.address}
            onChange={(e) => setProfile({ ...profile, address: e.target.value })}
            style={{ width: "100%", padding: "8px", marginBottom: "10px" }}
          />
        </div>
        <div>
          <label>City</label>
          <input
            type="text"
            value={profile.city}
            onChange={(e) => setProfile({ ...profile, city: e.target.value })}
            style={{ width: "100%", padding: "8px", marginBottom: "10px" }}
          />
        </div>
        <div>
          <label>State</label>
          <input
            type="text"
            value={profile.state}
            onChange={(e) => setProfile({ ...profile, state: e.target.value })}
            style={{ width: "100%", padding: "8px", marginBottom: "10px" }}
          />
        </div>
        <div>
          <label>Pincode</label>
          <input
            type="text"
            value={profile.pincode}
            onChange={(e) => setProfile({ ...profile, pincode: e.target.value })}
            style={{ width: "100%", padding: "8px", marginBottom: "15px" }}
          />
        </div>
        <button type="submit" disabled={saving} style={{ padding: "10px 20px" }}>
          {saving ? "Saving..." : "Save Address & Profile"}
        </button>
      </form>
    </div>
  );
}