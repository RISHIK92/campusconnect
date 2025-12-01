"use client";

import React, { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { useAuth } from "../../contexts/AuthContext";
import API_URL from "../../lib/api";
import {
  Calendar,
  MapPin,
  Clock,
  Download,
  CheckCircle,
  XCircle,
  Loader2,
  ArrowLeft,
  QrCode,
} from "lucide-react";
import { toast } from "react-toastify";
import Link from "next/link";

export default function MyRegistrationsPage() {
  const { token, isAuthenticated } = useAuth();
  const router = useRouter();
  const [registrations, setRegistrations] = useState([]);
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState("all"); // all, upcoming, past, attended, not-attended

  useEffect(() => {
    if (!isAuthenticated) {
      router.push("/login?redirect=/registrations");
      return;
    }
    fetchRegistrations();
  }, [isAuthenticated, token]);

  const fetchRegistrations = async () => {
    try {
      const response = await fetch(`${API_URL}/api/registrations/my`, {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });

      if (!response.ok) {
        throw new Error("Failed to fetch registrations");
      }

      const data = await response.json();
      setRegistrations(data);
    } catch (error) {
      console.error("Error fetching registrations:", error);
      toast.error("Failed to load registrations");
    } finally {
      setLoading(false);
    }
  };

  const downloadQRCode = (registration, eventTitle) => {
    if (!registration.qrCode) return;

    const link = document.createElement("a");
    link.href = registration.qrCode;
    link.download = `${eventTitle.replace(/\s+/g, "_")}_QR_Code.png`;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    toast.success("QR Code downloaded!");
  };

  const getFilteredRegistrations = () => {
    const now = new Date();

    return registrations.filter((reg) => {
      const eventDate = new Date(reg.event.date);
      const isPast = eventDate < now;

      switch (filter) {
        case "upcoming":
          return !isPast;
        case "past":
          return isPast;
        case "attended":
          return reg.attended;
        case "not-attended":
          return !reg.attended;
        default:
          return true;
      }
    });
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50">
        <Loader2 className="w-8 h-8 animate-spin text-black" />
      </div>
    );
  }

  const filteredRegistrations = getFilteredRegistrations();

  return (
    <div className="min-h-screen bg-gray-50 py-12 px-4 sm:px-6 lg:px-8">
      <div className="max-w-6xl mx-auto">
        <div className="mb-8">
          <Link
            href="/events"
            className="inline-flex items-center text-gray-600 hover:text-black mb-4 transition-colors"
          >
            <ArrowLeft className="w-4 h-4 mr-2" />
            Back to Events
          </Link>
          <h1 className="text-3xl font-bold text-gray-900">My Registrations</h1>
          <p className="mt-2 text-gray-600">
            View and manage all your event registrations
          </p>
        </div>

        {/* Filter Buttons */}
        <div className="mb-6 flex flex-wrap gap-2">
          {[
            { value: "all", label: "All" },
            { value: "upcoming", label: "Upcoming" },
            { value: "past", label: "Past" },
            { value: "attended", label: "Attended" },
            { value: "not-attended", label: "Not Attended" },
          ].map((filterOption) => (
            <button
              key={filterOption.value}
              onClick={() => setFilter(filterOption.value)}
              className={`px-4 py-2 rounded-lg font-medium transition-colors ${
                filter === filterOption.value
                  ? "bg-black text-white"
                  : "bg-white text-gray-700 border border-gray-300 hover:bg-gray-50"
              }`}
            >
              {filterOption.label}
            </button>
          ))}
        </div>

        {/* Registrations List */}
        {filteredRegistrations.length === 0 ? (
          <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-12 text-center">
            <QrCode className="w-16 h-16 text-gray-400 mx-auto mb-4" />
            <h3 className="text-lg font-medium text-gray-900 mb-2">
              No registrations found
            </h3>
            <p className="text-gray-600 mb-6">
              {filter === "all"
                ? "You haven't registered for any events yet."
                : `No ${filter.replace("-", " ")} registrations.`}
            </p>
            <Link
              href="/events"
              className="inline-block px-6 py-3 bg-black text-white rounded-lg font-medium hover:bg-gray-800 transition-colors"
            >
              Browse Events
            </Link>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {filteredRegistrations.map((registration) => {
              const isPast = new Date(registration.event.date) < new Date();

              return (
                <div
                  key={registration.id}
                  className="bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden hover:shadow-md transition-shadow"
                >
                  {registration.event.imageUrl && (
                    <div className="w-full h-48 bg-gray-100 relative">
                      <img
                        src={registration.event.imageUrl}
                        alt={registration.event.title}
                        className="w-full h-full object-cover"
                      />
                    </div>
                  )}

                  <div className="p-6">
                    <div className="flex items-start justify-between mb-3">
                      <h3 className="text-lg font-bold text-gray-900 flex-1">
                        {registration.event.title}
                      </h3>
                      {registration.attended ? (
                        <span className="ml-2 px-2 py-1 bg-green-100 text-green-800 text-xs font-medium rounded-full flex items-center">
                          <CheckCircle className="w-3 h-3 mr-1" />
                          Attended
                        </span>
                      ) : isPast ? (
                        <span className="ml-2 px-2 py-1 bg-red-100 text-red-800 text-xs font-medium rounded-full flex items-center">
                          <XCircle className="w-3 h-3 mr-1" />
                          Missed
                        </span>
                      ) : (
                        <span className="ml-2 px-2 py-1 bg-blue-100 text-blue-800 text-xs font-medium rounded-full">
                          Upcoming
                        </span>
                      )}
                    </div>

                    <div className="space-y-2 mb-4">
                      <div className="flex items-center text-sm text-gray-600">
                        <Calendar className="w-4 h-4 mr-2 text-gray-400" />
                        {new Date(registration.event.date).toLocaleDateString(
                          "en-US",
                          {
                            month: "short",
                            day: "numeric",
                            year: "numeric",
                          }
                        )}
                      </div>
                      <div className="flex items-center text-sm text-gray-600">
                        <Clock className="w-4 h-4 mr-2 text-gray-400" />
                        {registration.event.time}
                      </div>
                      <div className="flex items-center text-sm text-gray-600">
                        <MapPin className="w-4 h-4 mr-2 text-gray-400" />
                        {registration.event.venue}
                      </div>
                    </div>

                    {/* QR Code Section */}
                    <div className="bg-gray-50 p-4 rounded-lg mb-4">
                      <div className="bg-white p-3 rounded-lg shadow-sm border border-gray-200 inline-block w-full">
                        <img
                          src={registration.qrCode}
                          alt="Event QR Code"
                          className="w-full h-auto object-contain"
                        />
                      </div>
                      <p className="text-xs text-gray-500 mt-2 text-center">
                        {registration.attended
                          ? "Scanned at venue"
                          : "Show at venue"}
                      </p>
                    </div>

                    <button
                      onClick={() =>
                        downloadQRCode(registration, registration.event.title)
                      }
                      className="w-full py-2 px-4 bg-black text-white rounded-lg font-medium hover:bg-gray-800 transition-colors flex items-center justify-center"
                    >
                      <Download className="w-4 h-4 mr-2" />
                      Download QR Code
                    </button>

                    <p className="text-xs text-gray-400 mt-3 text-center break-all">
                      Registered:{" "}
                      {new Date(registration.registeredAt).toLocaleDateString()}
                    </p>
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>
    </div>
  );
}
