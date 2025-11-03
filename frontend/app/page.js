"use client";

import Link from "next/link";
import { useAuth } from "../contexts/AuthContext";

export default function HomePage() {
  const { isAuthenticated, user, isAdmin } = useAuth();

  return (
    <div className="min-h-screen bg-linear-to-b from-blue-50 to-white">
      {/* Hero Section */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-20">
        <div className="text-center">
          <h1 className="text-5xl font-bold text-gray-900 mb-6">
            Welcome to <span className="text-indigo-600">CampusConnect</span>
          </h1>
          <p className="text-xl text-gray-600 mb-8 max-w-3xl mx-auto">
            Your one-stop solution for college event registration. Register for
            events, get digital QR passes, and never miss an event again!
          </p>

          {isAuthenticated ? (
            <div className="flex justify-center space-x-4">
              <Link
                href={isAdmin() ? "/admin/dashboard" : "/events"}
                className="bg-indigo-600 text-white px-8 py-3 rounded-lg text-lg font-semibold hover:bg-indigo-700 transition"
              >
                {isAdmin() ? "Go to Dashboard" : "Browse Events"}
              </Link>
              <div className="bg-white border border-indigo-600 text-indigo-600 px-8 py-3 rounded-lg text-lg font-semibold">
                Welcome, {user?.name}!
              </div>
            </div>
          ) : (
            <div className="flex justify-center space-x-4">
              <Link
                href="/signup"
                className="bg-indigo-600 text-white px-8 py-3 rounded-lg text-lg font-semibold hover:bg-indigo-700 transition"
              >
                Get Started
              </Link>
              <Link
                href="/login"
                className="bg-white text-indigo-600 px-8 py-3 rounded-lg text-lg font-semibold border-2 border-indigo-600 hover:bg-indigo-50 transition"
              >
                Login
              </Link>
            </div>
          )}
        </div>
      </div>

      {/* Features Section */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-16">
        <h2 className="text-3xl font-bold text-center text-gray-900 mb-12">
          Key Features
        </h2>
        <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-8">
          <div className="bg-white p-6 rounded-lg shadow-md hover:shadow-xl transition">
            <div className="text-indigo-600 text-4xl mb-4">📅</div>
            <h3 className="text-xl font-semibold mb-2">Easy Registration</h3>
            <p className="text-gray-600">
              Register for events with just a few clicks and get instant
              confirmation.
            </p>
          </div>

          <div className="bg-white p-6 rounded-lg shadow-md hover:shadow-xl transition">
            <div className="text-indigo-600 text-4xl mb-4">📱</div>
            <h3 className="text-xl font-semibold mb-2">Digital QR Passes</h3>
            <p className="text-gray-600">
              Get unique QR codes for each event for quick and contactless
              entry.
            </p>
          </div>

          <div className="bg-white p-6 rounded-lg shadow-md hover:shadow-xl transition">
            <div className="text-indigo-600 text-4xl mb-4">👥</div>
            <h3 className="text-xl font-semibold mb-2">Track Attendance</h3>
            <p className="text-gray-600">
              Organizers can easily track attendance and manage event capacity.
            </p>
          </div>

          <div className="bg-white p-6 rounded-lg shadow-md hover:shadow-xl transition">
            <div className="text-indigo-600 text-4xl mb-4">📊</div>
            <h3 className="text-xl font-semibold mb-2">Admin Dashboard</h3>
            <p className="text-gray-600">
              Comprehensive analytics and management tools for administrators.
            </p>
          </div>
        </div>
      </div>

      {/* CTA Section */}
      {!isAuthenticated && (
        <div className="bg-indigo-600 py-16">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
            <h2 className="text-3xl font-bold text-white mb-4">
              Ready to get started?
            </h2>
            <p className="text-xl text-indigo-100 mb-8">
              Join thousands of students managing their event registrations
              efficiently.
            </p>
            <Link
              href="/signup"
              className="bg-white text-indigo-600 px-8 py-3 rounded-lg text-lg font-semibold hover:bg-gray-100 transition inline-block"
            >
              Create an Account
            </Link>
          </div>
        </div>
      )}
    </div>
  );
}
