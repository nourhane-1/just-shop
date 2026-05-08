"use client";

import { useState, useEffect } from "react";
import { useSession } from "next-auth/react";
import { User, Lock } from "lucide-react";

export default function SettingsPage() {
  const { data: session, update } = useSession();
  const [profileLoading, setProfileLoading] = useState(false);
  const [passLoading, setPassLoading] = useState(false);
  const [dataLoading, setDataLoading] = useState(true);
  const [profileMsg, setProfileMsg] = useState("");
  const [passMsg, setPassMsg] = useState("");

  const [profile, setProfile] = useState({
    name: "",
    phone: "",
  });

  const [passwords, setPasswords] = useState({
    currentPassword: "",
    newPassword: "",
    confirmPassword: "",
  });


  useEffect(() => {
    async function loadUser() {
      try {
        const res = await fetch("/api/users/me", { credentials: "include" });
        if (res.ok) {
          const data = await res.json();
          setProfile({
            name: data.name ?? session?.user?.name ?? "",
            phone: data.phone ?? "",
          });
        } else {
          
          setProfile({
            name: session?.user?.name ?? "",
            phone: "",
          });
        }
      } catch {
        setProfile({
          name: session?.user?.name ?? "",
          phone: "",
        });
      }
      setDataLoading(false);
    }
    loadUser();
  }, [session]);

  async function handleProfileSave() {
    setProfileLoading(true);
    setProfileMsg("");

    try {
      const res = await fetch("/api/users/me", {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        credentials: "include",
        body: JSON.stringify(profile),
      });

      if (res.ok) {
        await update({ name: profile.name });
        setProfileMsg("Profile updated successfully!");
      } else {
        const data = await res.json();
        setProfileMsg(data.error || "Failed to update profile.");
      }
    } catch {
      setProfileMsg("Failed to update profile.");
    }

    setProfileLoading(false);
    setTimeout(() => setProfileMsg(""), 3000);
  }

  async function handlePasswordChange() {
    setPassMsg("");

    if (passwords.newPassword !== passwords.confirmPassword) {
      setPassMsg("Passwords don't match.");
      return;
    }
    if (passwords.newPassword.length < 8) {
      setPassMsg("Password must be at least 8 characters.");
      return;
    }

    setPassLoading(true);

    try {
      const res = await fetch("/api/users/me/password", {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        credentials: "include",
        body: JSON.stringify({
          currentPassword: passwords.currentPassword,
          newPassword: passwords.newPassword,
        }),
      });

      if (res.ok) {
        setPassMsg("Password changed successfully!");
        setPasswords({
          currentPassword: "",
          newPassword: "",
          confirmPassword: "",
        });
      } else {
        const d = await res.json();
        setPassMsg(d.error ?? "Failed to change password.");
      }
    } catch {
      setPassMsg("Failed to change password.");
    }

    setPassLoading(false);
    setTimeout(() => setPassMsg(""), 3000);
  }

  function getStrength(pass: string) {
    let score = 0;
    if (pass.length >= 8) score++;
    if (/[A-Z]/.test(pass)) score++;
    if (/[0-9]/.test(pass)) score++;
    if (/[^A-Za-z0-9]/.test(pass)) score++;
    return score;
  }

  const strength = getStrength(passwords.newPassword);
  const strengthLabels = ["", "Weak", "Fair", "Good", "Strong"];
  const strengthColors = [
    "",
    "bg-red-400",
    "bg-amber-400",
    "bg-blue-400",
    "bg-green-400",
  ];

  if (dataLoading) {
    return (
      <div className="space-y-6">
        <h1 className="text-2xl font-bold text-gray-900">Settings</h1>
        <div className="bg-white rounded-2xl border border-gray-100 p-6 shadow-sm animate-pulse">
          <div className="h-6 bg-gray-200 rounded w-1/3 mb-6"></div>
          <div className="grid grid-cols-2 gap-4">
            <div className="h-10 bg-gray-200 rounded"></div>
            <div className="h-10 bg-gray-200 rounded"></div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <h1 className="text-2xl font-bold text-gray-900">Settings</h1>

     
      <div className="bg-white rounded-2xl border border-gray-100 p-6 shadow-sm">
        <div className="flex items-center gap-2 mb-6">
          <User size={18} className="text-[#F97316]" />
          <h2 className="font-semibold text-gray-900">Profile Information</h2>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <div>
            <label className="text-xs text-gray-600 mb-1 block font-medium">
              Full Name
            </label>
            <input
              value={profile.name}
              onChange={(e) =>
                setProfile({ ...profile, name: e.target.value })
              }
              className="w-full border border-gray-200 rounded-lg px-3 py-2 text-sm focus:outline-none focus:border-[#F97316] focus:ring-1 focus:ring-[#F97316] transition-colors"
            />
          </div>
          <div>
            <label className="text-xs text-gray-600 mb-1 block font-medium">
              Email
            </label>
            <input
              value={session?.user?.email ?? ""}
              disabled
              className="w-full border border-gray-200 rounded-lg px-3 py-2 text-sm bg-gray-50 text-gray-400 cursor-not-allowed"
            />
          </div>
          <div>
            <label className="text-xs text-gray-600 mb-1 block font-medium">
              Phone
            </label>
            <input
              value={profile.phone}
              onChange={(e) =>
                setProfile({ ...profile, phone: e.target.value })
              }
              placeholder="+20 1234567890"
              className="w-full border border-gray-200 rounded-lg px-3 py-2 text-sm focus:outline-none focus:border-[#F97316] focus:ring-1 focus:ring-[#F97316] transition-colors"
            />
          </div>
        </div>

        {profileMsg && (
          <p
            className={`text-sm mt-3 ${
              profileMsg.includes("success")
                ? "text-green-600"
                : "text-red-500"
            }`}
          >
            {profileMsg}
          </p>
        )}

        <button
          onClick={handleProfileSave}
          disabled={profileLoading}
          className="mt-6 bg-[#F97316] hover:bg-orange-600 text-white px-6 py-2 rounded-lg text-sm font-medium disabled:opacity-50 transition-colors"
        >
          {profileLoading ? "Saving..." : "Save Changes"}
        </button>
      </div>

     
      <div className="bg-white rounded-2xl border border-gray-100 p-6 shadow-sm">
        <div className="flex items-center gap-2 mb-6">
          <Lock size={18} className="text-[#F97316]" />
          <h2 className="font-semibold text-gray-900">Change Password</h2>
        </div>

        <div className="space-y-4 max-w-md">
          <div>
            <label className="text-xs text-gray-600 mb-1 block font-medium">
              Current Password
            </label>
            <input
              type="password"
              value={passwords.currentPassword}
              onChange={(e) =>
                setPasswords({
                  ...passwords,
                  currentPassword: e.target.value,
                })
              }
              className="w-full border border-gray-200 rounded-lg px-3 py-2 text-sm focus:outline-none focus:border-[#F97316] focus:ring-1 focus:ring-[#F97316] transition-colors"
            />
          </div>
          <div>
            <label className="text-xs text-gray-600 mb-1 block font-medium">
              New Password
            </label>
            <input
              type="password"
              value={passwords.newPassword}
              onChange={(e) =>
                setPasswords({
                  ...passwords,
                  newPassword: e.target.value,
                })
              }
              className="w-full border border-gray-200 rounded-lg px-3 py-2 text-sm focus:outline-none focus:border-[#F97316] focus:ring-1 focus:ring-[#F97316] transition-colors"
            />
            {passwords.newPassword && (
              <div className="mt-2">
                <div className="flex gap-1">
                  {[1, 2, 3, 4].map((i) => (
                    <div
                      key={i}
                      className={`h-1 flex-1 rounded-full transition-all ${
                        i <= strength
                          ? strengthColors[strength]
                          : "bg-gray-200"
                      }`}
                    />
                  ))}
                </div>
                <p className="text-xs mt-1 text-gray-500">
                  {strengthLabels[strength]}
                </p>
              </div>
            )}
          </div>
          <div>
            <label className="text-xs text-gray-600 mb-1 block font-medium">
              Confirm New Password
            </label>
            <input
              type="password"
              value={passwords.confirmPassword}
              onChange={(e) =>
                setPasswords({
                  ...passwords,
                  confirmPassword: e.target.value,
                })
              }
              className="w-full border border-gray-200 rounded-lg px-3 py-2 text-sm focus:outline-none focus:border-[#F97316] focus:ring-1 focus:ring-[#F97316] transition-colors"
            />
          </div>
        </div>

        {passMsg && (
          <p
            className={`text-sm mt-3 ${
              passMsg.includes("success") ? "text-green-600" : "text-red-500"
            }`}
          >
            {passMsg}
          </p>
        )}

        <button
          onClick={handlePasswordChange}
          disabled={passLoading}
          className="mt-6 bg-[#1E3A5F] hover:bg-blue-900 text-white px-6 py-2 rounded-lg text-sm font-medium disabled:opacity-50 transition-colors"
        >
          {passLoading ? "Updating..." : "Update Password"}
        </button>
      </div>
    </div>
  );
}