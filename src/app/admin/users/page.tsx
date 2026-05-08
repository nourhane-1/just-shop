"use client";

import { useState, useEffect } from "react";
import { Search, Shield, ShieldOff } from "lucide-react";
import { formatDate } from "@/lib/utils";
import { toast } from "sonner";

const roleBadge: Record<string, string> = {
  admin: "bg-red-100 text-red-700",
  seller: "bg-blue-100 text-blue-700",
  customer: "bg-gray-100 text-gray-700",
};

export default function AdminUsersPage() {
  const [users, setUsers] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState("");
  const [roleFilter, setRoleFilter] = useState("all");
  const [updatingId, setUpdatingId] = useState<string | null>(null);

  useEffect(() => {
    fetch("/api/admin/users", { credentials: "include" })
      .then((r) => r.json())
      .then((d) => {
        setUsers(d.users ?? []);
        setLoading(false);
      })
      .catch(() => {
        toast.error("Failed to load users");
        setLoading(false);
      });
  }, []);

  async function toggleBlock(userId: string, isBlocked: boolean) {
    setUpdatingId(userId);

    const res = await fetch(`/api/admin/users/${userId}`, {
      method: "PUT",
      headers: { "Content-Type": "application/json" },
      credentials: "include",
      body: JSON.stringify({ isBlocked: !isBlocked }),
    });

    if (res.ok) {
      setUsers((prev) =>
        prev.map((u) =>
          u._id === userId ? { ...u, isBlocked: !isBlocked } : u
        )
      );
      toast.success(isBlocked ? "User unblocked successfully" : "User blocked successfully");
    } else {
      toast.error("Failed to update user status");
    }

    setUpdatingId(null);
  }

  async function changeRole(userId: string, newRole: string) {
    setUpdatingId(userId);

    const res = await fetch(`/api/admin/users/${userId}`, {
      method: "PUT",
      headers: { "Content-Type": "application/json" },
      credentials: "include",
      body: JSON.stringify({ role: newRole }),
    });

    if (res.ok) {
      setUsers((prev) =>
        prev.map((u) =>
          u._id === userId ? { ...u, role: newRole } : u
        )
      );
      toast.success(`Role changed to ${newRole}`);
    } else {
      const data = await res.json();
      toast.error(data.error || "Failed to change role");
    }

    setUpdatingId(null);
  }

  const filtered = users.filter((u) => {
    const matchSearch =
      u.name?.toLowerCase().includes(search.toLowerCase()) ||
      u.email?.toLowerCase().includes(search.toLowerCase());
    const matchRole = roleFilter === "all" || u.role === roleFilter;
    return matchSearch && matchRole;
  });

  return (
    <div>
      <h1 className="text-2xl font-bold text-gray-900 mb-6">Users</h1>

     
      <div className="flex flex-col sm:flex-row gap-4 mb-6">
        <div className="relative flex-1">
          <Search
            size={18}
            className="absolute left-3 top-2.5 text-gray-400"
          />
          <input
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Search users..."
            className="w-full pl-10 pr-4 py-2.5 border border-gray-200 rounded-xl text-sm focus:outline-none focus:border-[#F97316] focus:ring-1 focus:ring-[#F97316]"
          />
        </div>
        <select
          value={roleFilter}
          onChange={(e) => setRoleFilter(e.target.value)}
          className="px-4 py-2.5 border border-gray-200 rounded-xl text-sm focus:outline-none focus:border-[#F97316]"
        >
          <option value="all">All Roles</option>
          <option value="customer">Customer</option>
          <option value="seller">Seller</option>
          <option value="admin">Admin</option>
        </select>
      </div>

   
      <div className="bg-white rounded-2xl border border-gray-100 shadow-sm overflow-x-auto">
        {loading ? (
          <div className="p-8 text-center text-gray-400">Loading...</div>
        ) : (
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b border-gray-100 text-gray-500 text-xs uppercase tracking-wider">
                <th className="text-left px-6 py-4">User</th>
                <th className="text-left px-6 py-4">Email</th>
                <th className="text-left px-6 py-4">Role</th>
                <th className="text-left px-6 py-4">Change Role</th>
                <th className="text-left px-6 py-4">Status</th>
                <th className="text-left px-6 py-4">Joined</th>
                <th className="text-left px-6 py-4">Actions</th>
              </tr>
            </thead>
            <tbody>
              {filtered.map((user) => (
                <tr
                  key={user._id}
                  className="border-b border-gray-50 hover:bg-gray-50"
                >
                  <td className="px-6 py-4">
                    <div className="flex items-center gap-3">
                      <div className="w-8 h-8 rounded-full bg-[#1E3A5F] flex items-center justify-center overflow-hidden">
                        {user.image ? (
                          <img
                            src={user.image}
                            alt=""
                            className="w-8 h-8 rounded-full object-cover"
                          />
                        ) : (
                          <span className="text-white text-xs font-bold">
                            {user.name?.[0]?.toUpperCase() ?? "U"}
                          </span>
                        )}
                      </div>
                      <span className="font-medium text-gray-900">
                        {user.name}
                      </span>
                    </div>
                  </td>

                  <td className="px-6 py-4 text-gray-500">{user.email}</td>

                  <td className="px-6 py-4">
                    <span
                      className={`px-3 py-1 rounded-full text-xs font-semibold capitalize ${
                        roleBadge[user.role] ?? roleBadge.customer
                      }`}
                    >
                      {user.role}
                    </span>
                  </td>

                  <td className="px-6 py-4">
                    <select
                      value={user.role}
                      onChange={(e) => changeRole(user._id, e.target.value)}
                      disabled={updatingId === user._id}
                      className="px-3 py-2 border border-gray-200 rounded-lg text-xs focus:outline-none focus:border-[#F97316]"
                    >
                      <option value="customer">Customer</option>
                      <option value="seller">Seller</option>
                      <option value="admin">Admin</option>
                    </select>
                  </td>

                  <td className="px-6 py-4">
                    <span
                      className={`px-3 py-1 rounded-full text-xs font-semibold ${
                        user.isBlocked
                          ? "bg-red-100 text-red-700"
                          : "bg-green-100 text-green-700"
                      }`}
                    >
                      {user.isBlocked ? "Blocked" : "Active"}
                    </span>
                  </td>

                  <td className="px-6 py-4 text-gray-500">
                    {formatDate(user.createdAt)}
                  </td>

                  <td className="px-6 py-4">
                    <button
                      onClick={() => toggleBlock(user._id, user.isBlocked)}
                      disabled={updatingId === user._id}
                      className={`flex items-center gap-1 text-xs font-medium px-3 py-1.5 rounded-lg transition ${
                        user.isBlocked
                          ? "text-green-600 hover:bg-green-50"
                          : "text-red-600 hover:bg-red-50"
                      } disabled:opacity-50`}
                    >
                      {user.isBlocked ? (
                        <>
                          <Shield size={14} /> Unblock
                        </>
                      ) : (
                        <>
                          <ShieldOff size={14} /> Block
                        </>
                      )}
                    </button>
                  </td>
                </tr>
              ))}

              {filtered.length === 0 && (
                <tr>
                  <td
                    colSpan={7}
                    className="px-6 py-8 text-center text-gray-400"
                  >
                    No users found
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        )}
      </div>
    </div>
  );
}