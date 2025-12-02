"use client";

import React, { useState, useEffect } from "react";
import { useParams, useRouter } from "next/navigation";
import { useAuth } from "../../../contexts/AuthContext";
import API_URL from "../../../lib/api";
import {
  Calendar,
  MapPin,
  Clock,
  Users,
  ArrowLeft,
  Loader2,
  CheckCircle,
  AlertCircle,
  Download,
} from "lucide-react";
import { toast } from "react-toastify";
import Link from "next/link";

export default function EventDetailsPage() {
  const { id } = useParams();
  const router = useRouter();
  const { token, user, isAuthenticated } = useAuth();
  const [event, setEvent] = useState(null);
  const [loading, setLoading] = useState(true);
  const [registering, setRegistering] = useState(false);
  const [registration, setRegistration] = useState(null);

  useEffect(() => {
    if (id) {
      fetchEventDetails();
      if (isAuthenticated) {
        checkRegistrationStatus();
      }
    }
  }, [id, isAuthenticated, token]);

  const fetchEventDetails = async () => {
    try {
      const headers = {};
      if (token) {
        headers["Authorization"] = `Bearer ${token}`;
      }

      const response = await fetch(`${API_URL}/api/events/${id}`, {
        headers,
      });

      if (!response.ok) {
        throw new Error("Failed to fetch event details");
      }

      const data = await response.json();
      setEvent(data);
    } catch (error) {
      console.error("Error fetching event:", error);
      toast.error("Failed to load event details");
    } finally {
      setLoading(false);
    }
  };

  const checkRegistrationStatus = async () => {
    try {
      const response = await fetch(`${API_URL}/api/registrations/my`, {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });

      if (response.ok) {
        const registrations = await response.json();
        const myReg = registrations.find((r) => r.eventId === id);
        if (myReg) {
          setRegistration(myReg);
        }
      }
    } catch (error) {
      console.error("Error checking registration:", error);
    }
  };

  const handleRegister = async () => {
    if (!isAuthenticated) {
      toast.info("Please login to register");
      router.push("/login");
      return;
    }

    setRegistering(true);
    try {
      const response = await fetch(`${API_URL}/api/events/${id}/register`, {
        method: "POST",
        headers: {
          Authorization: `Bearer ${token}`,
          "Content-Type": "application/json",
        },
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error || "Registration failed");
      }

      toast.success("Successfully registered!");
      setRegistration(data.registration);
      // Refresh event data to update capacity count if we were tracking it
      fetchEventDetails();
    } catch (error) {
      console.error("Registration error:", error);
      toast.error(error.message);
    } finally {
      setRegistering(false);
    }
  };

  const handleDeregister = async () => {
    if (!confirm("Are you sure you want to cancel your registration?")) return;

    setRegistering(true);
    try {
      const response = await fetch(
        `${API_URL}/api/registrations/${registration.id}`,
        {
          method: "DELETE",
          headers: {
            Authorization: `Bearer ${token}`,
          },
        }
      );

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error || "Deregistration failed");
      }

      toast.success("Registration cancelled successfully");
      setRegistration(null);
      fetchEventDetails();
    } catch (error) {
      console.error("Deregistration error:", error);
      toast.error(error.message);
    } finally {
      setRegistering(false);
    }
  };

  const downloadQRCode = () => {
    if (!registration || !registration.qrCode) return;

    // Create a link element
    const link = document.createElement("a");
    link.href = registration.qrCode;
    link.download = `${event.title.replace(/\s+/g, "_")}_QR_Code.png`;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    toast.success("QR Code downloaded!");
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50">
        <Loader2 className="w-8 h-8 animate-spin text-black" />
      </div>
    );
  }

  if (!event) {
    return (
      <div className="min-h-screen flex flex-col items-center justify-center bg-gray-50">
        <h2 className="text-2xl font-bold text-gray-900 mb-4">
          Event not found
        </h2>
        <Link
          href="/events"
          className="text-blue-600 hover:text-blue-800 flex items-center"
        >
          <ArrowLeft className="w-4 h-4 mr-2" />
          Back to Events
        </Link>
      </div>
    );
  }

  const isFull = event._count?.registrations >= event.capacity;
  const isPast = new Date(event.date) < new Date();

  return (
    <div className="min-h-screen bg-gray-50 py-12 px-4 sm:px-6 lg:px-8">
      <div className="max-w-4xl mx-auto">
        <Link
          href="/events"
          className="inline-flex items-center text-gray-600 hover:text-black mb-8 transition-colors"
        >
          <ArrowLeft className="w-4 h-4 mr-2" />
          Back to Events
        </Link>

        <div className="bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden">
          {event.imageUrl && (
            <div className="w-full h-64 sm:h-96 bg-gray-100 relative">
              <img
                src={event.imageUrl}
                alt={event.title}
                className="w-full h-full object-cover"
              />
            </div>
          )}

          <div className="p-8">
            <div className="flex flex-col md:flex-row md:items-start justify-between gap-6">
              <div className="flex-1">
                <div className="flex items-center gap-3 mb-4">
                  <span className="px-3 py-1 bg-blue-50 text-blue-700 text-sm font-medium rounded-full">
                    {event.category || "Event"}
                  </span>
                  {isPast && (
                    <span className="px-3 py-1 bg-gray-100 text-gray-600 text-sm font-medium rounded-full">
                      Past Event
                    </span>
                  )}
                  {isFull && !registration && !isPast && (
                    <span className="px-3 py-1 bg-red-50 text-red-700 text-sm font-medium rounded-full">
                      Event Full
                    </span>
                  )}
                </div>

                <h1 className="text-3xl sm:text-4xl font-bold text-gray-900 mb-4">
                  {event.title}
                </h1>

                <p className="text-gray-600 text-lg leading-relaxed mb-8">
                  {event.description}
                </p>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-6 mb-8">
                  <div className="flex items-center text-gray-700">
                    <Calendar className="w-5 h-5 mr-3 text-gray-400" />
                    <div>
                      <p className="text-sm text-gray-500">Date</p>
                      <p className="font-medium">
                        {new Date(event.date).toLocaleDateString("en-US", {
                          weekday: "long",
                          year: "numeric",
                          month: "long",
                          day: "numeric",
                        })}
                      </p>
                    </div>
                  </div>

                  <div className="flex items-center text-gray-700">
                    <Clock className="w-5 h-5 mr-3 text-gray-400" />
                    <div>
                      <p className="text-sm text-gray-500">Time</p>
                      <p className="font-medium">{event.time}</p>
                    </div>
                  </div>

                  <div className="flex items-center text-gray-700">
                    <MapPin className="w-5 h-5 mr-3 text-gray-400" />
                    <div>
                      <p className="text-sm text-gray-500">Venue</p>
                      <p className="font-medium">{event.venue}</p>
                    </div>
                  </div>

                  <div className="flex items-center text-gray-700">
                    <Users className="w-5 h-5 mr-3 text-gray-400" />
                    <div>
                      <p className="text-sm text-gray-500">Capacity</p>
                      <p className="font-medium">
                        {event._count?.registrations || 0} / {event.capacity}{" "}
                        registered
                      </p>
                    </div>
                  </div>
                </div>
              </div>

              <div className="md:w-80 flex-shrink-0">
                <div className="bg-gray-50 p-6 rounded-lg border border-gray-200">
                  {registration ? (
                    <div className="text-center">
                      <div className="bg-green-100 text-green-800 p-3 rounded-lg flex items-center justify-center mb-4">
                        <CheckCircle className="w-5 h-5 mr-2" />
                        <span className="font-medium">Registered</span>
                      </div>
                      <p className="text-sm text-gray-600 mb-4">
                        Show this QR code at the venue for entry.
                      </p>
                      <div className="bg-white p-4 rounded-lg shadow-sm border border-gray-200 inline-block mb-4">
                        <img
                          src={registration.qrCode}
                          alt="Event QR Code"
                          className="w-48 h-48 object-contain"
                        />
                      </div>
                      <button
                        onClick={downloadQRCode}
                        className="w-full mb-3 py-2 px-4 bg-black text-white rounded-lg font-medium hover:bg-gray-800 transition-colors"
                      >
                        Download QR Code
                      </button>
                      <Link
                        href="/registrations"
                        className="block w-full py-2 px-4 bg-gray-100 text-gray-800 rounded-lg font-medium hover:bg-gray-200 transition-colors mb-3"
                      >
                        View All Registrations
                      </Link>
                      {!isPast && !registration.attended && (
                        <button
                          onClick={handleDeregister}
                          disabled={registering}
                          className="w-full py-2 px-4 bg-red-50 text-red-600 rounded-lg font-medium hover:bg-red-100 transition-colors border border-red-200"
                        >
                          {registering ? (
                            <span className="flex items-center justify-center">
                              <Loader2 className="w-4 h-4 animate-spin mr-2" />
                              Cancelling...
                            </span>
                          ) : (
                            "Cancel Registration"
                          )}
                        </button>
                      )}
                      <p className="text-xs text-gray-400 mt-4 break-all">
                        ID: {registration.id}
                      </p>
                    </div>
                  ) : (
                    <div className="text-center">
                      <h3 className="text-lg font-bold text-gray-900 mb-2">
                        Registration
                      </h3>
                      <p className="text-gray-600 text-sm mb-6">
                        Secure your spot for this event now.
                      </p>

                      {isAuthenticated ? (
                        <button
                          onClick={handleRegister}
                          disabled={registering || isFull || isPast}
                          className={`w-full py-3 px-4 rounded-lg font-medium text-white transition-colors ${
                            isFull || isPast
                              ? "bg-gray-400 cursor-not-allowed"
                              : "bg-black hover:bg-gray-800"
                          }`}
                        >
                          {registering ? (
                            <span className="flex items-center justify-center">
                              <Loader2 className="w-4 h-4 animate-spin mr-2" />
                              Registering...
                            </span>
                          ) : isPast ? (
                            "Event Ended"
                          ) : isFull ? (
                            "Sold Out"
                          ) : (
                            "Register Now"
                          )}
                        </button>
                      ) : (
                        <Link
                          href={`/login?redirect=/events/${id}`}
                          className="block w-full py-3 px-4 bg-black text-white rounded-lg font-medium hover:bg-gray-800 transition-colors"
                        >
                          Login to Register
                        </Link>
                      )}
                    </div>
                  )}
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
