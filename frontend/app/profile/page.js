"use client";

import React, { useState } from "react";
import { useAuth } from "../../contexts/AuthContext";
import API_URL from "../../lib/api";
import { toast } from "react-toastify";
import { User, Mail, Hash, Save, Loader2, ArrowLeft } from "lucide-react";
import Link from "next/link";

export default function ProfilePage() {
  const { user, token, updateUser } = useAuth();
  const [isEditing, setIsEditing] = useState(false);
  const [saving, setSaving] = useState(false);
  const [formData, setFormData] = useState({
    name: user?.name || "",
    rollNumber: user?.rollNumber || "",
  });

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({
      ...prev,
      [name]: value,
    }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setSaving(true);

    try {
      const response = await fetch(`${API_URL}/api/profile`, {
        method: "PUT",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify(formData),
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error || "Failed to update profile");
      }

      updateUser(data.user);
      toast.success("Profile updated successfully");
      setIsEditing(false);
    } catch (error) {
      console.error("Profile update error:", error);
      toast.error(error.message);
    } finally {
      setSaving(false);
    }
  };

  if (!user) {
    return null;
  }

  return (
    <div className="min-h-screen bg-gray-50 py-12 px-4 sm:px-6 lg:px-8">
      <div className="max-w-2xl mx-auto">
        <Link
          href="/"
          className="inline-flex items-center text-gray-600 hover:text-black mb-8 transition-colors"
        >
          <ArrowLeft className="w-4 h-4 mr-2" />
          Back to Home
        </Link>

        <div className="bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden">
          <div className="bg-black px-8 py-6">
            <h1 className="text-2xl font-bold text-white">My Profile</h1>
            <p className="text-gray-400 mt-1">Manage your account details</p>
          </div>

          <div className="p-8">
            <form onSubmit={handleSubmit}>
              <div className="space-y-6">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Email Address
                  </label>
                  <div className="relative">
                    <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                      <Mail className="h-5 w-5 text-gray-400" />
                    </div>
                    <input
                      type="email"
                      value={user.email}
                      disabled
                      className="block w-full pl-10 pr-3 py-2 border border-gray-300 rounded-lg bg-gray-50 text-gray-500 sm:text-sm"
                    />
                  </div>
                  <p className="mt-1 text-xs text-gray-500">
                    Email cannot be changed
                  </p>
                </div>

                <div>
                  <label
                    htmlFor="name"
                    className="block text-sm font-medium text-gray-700 mb-1"
                  >
                    Full Name
                  </label>
                  <div className="relative">
                    <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                      <User className="h-5 w-5 text-gray-400" />
                    </div>
                    <input
                      type="text"
                      name="name"
                      id="name"
                      value={isEditing ? formData.name : user.name}
                      onChange={handleChange}
                      disabled={!isEditing}
                      className={`block w-full pl-10 pr-3 py-2 border rounded-lg sm:text-sm transition-colors ${
                        isEditing
                          ? "border-gray-300 focus:ring-black focus:border-black text-black"
                          : "border-gray-200 bg-gray-50 text-gray-700"
                      }`}
                      required
                    />
                  </div>
                </div>

                <div>
                  <label
                    htmlFor="rollNumber"
                    className="block text-sm font-medium text-gray-700 mb-1"
                  >
                    Roll Number
                  </label>
                  <div className="relative">
                    <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                      <Hash className="h-5 w-5 text-gray-400" />
                    </div>
                    <input
                      type="text"
                      name="rollNumber"
                      id="rollNumber"
                      value={
                        isEditing
                          ? formData.rollNumber
                          : user.rollNumber || "Not set"
                      }
                      onChange={handleChange}
                      disabled={!isEditing}
                      className={`block w-full pl-10 pr-3 py-2 border rounded-lg sm:text-sm transition-colors ${
                        isEditing
                          ? "border-gray-300 focus:ring-black focus:border-black text-black"
                          : "border-gray-200 bg-gray-50 text-gray-700"
                      }`}
                    />
                  </div>
                </div>

                <div className="pt-6 flex items-center justify-end space-x-4 border-t border-gray-100">
                  {isEditing ? (
                    <>
                      <button
                        type="button"
                        onClick={() => {
                          setIsEditing(false);
                          setFormData({
                            name: user.name,
                            rollNumber: user.rollNumber || "",
                          });
                        }}
                        className="px-4 py-2 text-sm font-medium text-gray-700 bg-white border border-gray-300 rounded-lg hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-black"
                        disabled={saving}
                      >
                        Cancel
                      </button>
                      <button
                        type="submit"
                        disabled={saving}
                        className="inline-flex items-center px-4 py-2 text-sm font-medium text-white bg-black border border-transparent rounded-lg hover:bg-gray-800 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-black"
                      >
                        {saving ? (
                          <>
                            <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                            Saving...
                          </>
                        ) : (
                          <>
                            <Save className="w-4 h-4 mr-2" />
                            Save Changes
                          </>
                        )}
                      </button>
                    </>
                  ) : (
                    <button
                      type="button"
                      onClick={() => setIsEditing(true)}
                      className="inline-flex items-center px-4 py-2 text-sm font-medium text-white bg-black border border-transparent rounded-lg hover:bg-gray-800 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-black"
                    >
                      Edit Profile
                    </button>
                  )}
                </div>
              </div>
            </form>
          </div>
        </div>
      </div>
    </div>
  );
}
