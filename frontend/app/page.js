"use client";

import React from "react";
import Link from "next/link";
import { useAuth } from "../contexts/AuthContext";
import {
  Calendar,
  QrCode,
  Users,
  BarChart3,
  ArrowRight,
  LogOut,
} from "lucide-react";

export default function HomePage() {
  const { user, isAuthenticated, logout, isAdmin } = useAuth();

  return (
    <div className="min-h-screen bg-white">
      <nav className="border-b border-gray-200">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-5">
          <div className="flex justify-between items-center">
            <div className="flex items-center space-x-3">
              <div className="w-8 h-8 bg-black rounded-sm"></div>
              <span className="text-2xl font-bold text-black tracking-tight">
                CampusConnect
              </span>
            </div>

            {isAuthenticated && (
              <button
                onClick={logout}
                className="flex items-center space-x-2 px-5 py-2 border border-gray-300 hover:border-black transition-colors duration-200"
              >
                <span className="text-sm font-medium text-gray-900">
                  Logout
                </span>
                <LogOut className="w-4 h-4 text-gray-900" />
              </button>
            )}
          </div>
        </div>
      </nav>

      {/* Hero Section */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pt-24 pb-32">
        <div className="max-w-4xl">
          <div className="inline-block px-4 py-1 border border-gray-300 text-xs font-medium text-gray-900 tracking-wide uppercase mb-8">
            Event Management Platform
          </div>

          <h1 className="text-6xl md:text-7xl font-bold text-black mb-8 leading-tight tracking-tight">
            Welcome to
            <br />
            CampusConnect
          </h1>

          <p className="text-xl text-gray-600 mb-12 max-w-2xl leading-relaxed">
            Your one-stop solution for college event registration. Register for
            events, get digital QR passes, and never miss an event again.
          </p>

          {isAuthenticated ? (
            <div className="flex flex-col sm:flex-row items-start gap-4">
              <Link
                href={isAdmin() ? "/admin/dashboard" : "/events"}
                className="group inline-flex items-center space-x-2 px-8 py-4 bg-black text-white font-medium hover:bg-gray-900 transition-colors duration-200"
              >
                <span>{isAdmin() ? "Go to Dashboard" : "Browse Events"}</span>
                <ArrowRight className="w-5 h-5 group-hover:translate-x-1 transition-transform" />
              </Link>
              <div className="px-8 py-4 border border-gray-300 text-gray-900 font-medium">
                Welcome, {user?.name}
              </div>
            </div>
          ) : (
            <div className="flex flex-col sm:flex-row gap-4">
              <Link
                href="/signup"
                className="group inline-flex items-center justify-center space-x-2 px-8 py-4 bg-black text-white font-medium hover:bg-gray-900 transition-colors duration-200"
              >
                <span>Get Started</span>
                <ArrowRight className="w-5 h-5 group-hover:translate-x-1 transition-transform" />
              </Link>
              <Link
                href="/login"
                className="inline-flex items-center justify-center px-8 py-4 border-2 border-black text-black font-medium hover:bg-black hover:text-white transition-colors duration-200"
              >
                Login
              </Link>
            </div>
          )}
        </div>
      </div>

      {/* Features Section */}
      <div className="border-t border-gray-200 bg-gray-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-24">
          <div className="mb-20">
            <h2 className="text-4xl md:text-5xl font-bold text-black mb-4 tracking-tight">
              Key Features
            </h2>
            <p className="text-lg text-gray-600 max-w-2xl">
              Everything you need to manage campus events efficiently
            </p>
          </div>

          <div className="grid md:grid-cols-2 gap-px bg-gray-200">
            {[
              {
                icon: Calendar,
                title: "Easy Registration",
                description:
                  "Register for events with just a few clicks and get instant confirmation.",
              },
              {
                icon: QrCode,
                title: "Digital QR Passes",
                description:
                  "Get unique QR codes for each event for quick and contactless entry.",
              },
              {
                icon: Users,
                title: "Track Attendance",
                description:
                  "Organizers can easily track attendance and manage event capacity.",
              },
              {
                icon: BarChart3,
                title: "Admin Dashboard",
                description:
                  "Comprehensive analytics and management tools for administrators.",
              },
            ].map((feature, index) => (
              <div
                key={index}
                className="group bg-white p-12 hover:bg-gray-50 transition-colors duration-200"
              >
                <feature.icon
                  className="w-10 h-10 text-black mb-6"
                  strokeWidth={1.5}
                />
                <h3 className="text-2xl font-bold text-black mb-4 tracking-tight">
                  {feature.title}
                </h3>
                <p className="text-gray-600 leading-relaxed">
                  {feature.description}
                </p>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* CTA Section */}
      {!isAuthenticated && (
        <div className="border-t border-gray-200 bg-black">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-24">
            <div className="max-w-3xl">
              <h2 className="text-4xl md:text-5xl font-bold text-white mb-6 tracking-tight">
                Ready to get started?
              </h2>
              <p className="text-xl text-gray-400 mb-10 leading-relaxed">
                Join thousands of students managing their event registrations
                efficiently.
              </p>
              <Link
                href="/signup"
                className="group inline-flex items-center space-x-2 px-8 py-4 bg-white text-black font-medium hover:bg-gray-100 transition-colors duration-200"
              >
                <span>Create an Account</span>
                <ArrowRight className="w-5 h-5 group-hover:translate-x-1 transition-transform" />
              </Link>
            </div>
          </div>
        </div>
      )}

      {/* Footer */}
      <footer className="border-t border-gray-200 bg-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
          <p className="text-sm text-gray-600">
            © 2024 CampusConnect. Making campus events accessible to everyone.
          </p>
        </div>
      </footer>
    </div>
  );
}
