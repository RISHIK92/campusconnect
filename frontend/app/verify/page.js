"use client";

import React, { useState, useEffect, useRef } from "react";
import { useRouter } from "next/navigation";
import { useAuth } from "../../contexts/AuthContext";
import API_URL from "../../lib/api";
import { Html5QrcodeScanner } from "html5-qrcode";
import {
  Scan,
  CheckCircle,
  XCircle,
  Loader2,
  Search,
  ArrowLeft,
} from "lucide-react";
import { toast } from "react-toastify";
import Link from "next/link";

export default function VerifyPage() {
  const { token, isAuthenticated, isAdmin } = useAuth();
  const router = useRouter();
  const [loading, setLoading] = useState(true);
  const [scanResult, setScanResult] = useState(null);
  const [manualCode, setManualCode] = useState("");
  const [verifying, setVerifying] = useState(false);
  const scannerRef = useRef(null);

  useEffect(() => {
    if (!loading && (!isAuthenticated || !isAdmin())) {
      router.push("/");
      return;
    }
    setLoading(false);
  }, [loading, isAuthenticated, isAdmin, router]);

  useEffect(() => {
    if (!loading && isAuthenticated && isAdmin()) {
      // Initialize scanner
      const scanner = new Html5QrcodeScanner(
        "reader",
        { fps: 10, qrbox: { width: 250, height: 250 } },
        /* verbose= */ false
      );

      scanner.render(onScanSuccess, onScanFailure);
      scannerRef.current = scanner;

      return () => {
        if (scannerRef.current) {
          scannerRef.current.clear().catch((error) => {
            console.error("Failed to clear scanner", error);
          });
        }
      };
    }
  }, [loading, isAuthenticated, isAdmin]);

  const onScanSuccess = (decodedText, decodedResult) => {
    handleVerify(decodedText);
  };

  const onScanFailure = (error) => {
    // console.warn(`Code scan error = ${error}`);
  };

  const handleVerify = async (qrCodeData) => {
    if (verifying) return;
    setVerifying(true);
    setScanResult(null);

    try {
      // Temporarily pause scanner if running
      if (scannerRef.current) {
        scannerRef.current.pause();
      }

      const response = await fetch(
        `${API_URL}/api/registrations/verify/${encodeURIComponent(qrCodeData)}`,
        {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        }
      );

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error || "Verification failed");
      }

      setScanResult({
        success: true,
        message: data.message,
        data: data.registration,
      });
      toast.success(data.message);
    } catch (error) {
      console.error("Verification error:", error);
      setScanResult({
        success: false,
        message: error.message,
      });
      toast.error(error.message);
    } finally {
      setVerifying(false);
    }
  };

  const handleNextScan = () => {
    setScanResult(null);
    setManualCode("");
    if (scannerRef.current) {
      scannerRef.current.resume();
    }
  };

  const handleManualSubmit = (e) => {
    e.preventDefault();
    if (manualCode.trim()) {
      handleVerify(manualCode.trim());
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50">
        <Loader2 className="w-8 h-8 animate-spin text-black" />
      </div>
    );
  }

  if (!isAuthenticated || !isAdmin()) {
    return null;
  }

  return (
    <div className="min-h-screen bg-gray-50 py-12 px-4 sm:px-6 lg:px-8">
      <div className="max-w-3xl mx-auto">
        <div className="mb-8">
          <Link
            href="/admin/dashboard"
            className="inline-flex items-center text-gray-600 hover:text-black mb-4 transition-colors"
          >
            <ArrowLeft className="w-4 h-4 mr-2" />
            Back to Dashboard
          </Link>
          <h1 className="text-3xl font-bold text-black">Verify Attendance</h1>
          <p className="mt-2 text-black">
            Scan QR code or enter code manually to mark attendance
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
          {/* Scanner Section */}
          <div className="bg-white p-6 rounded-xl shadow-sm border border-black">
            <h2 className="text-lg font-semibold text-gray-900 mb-4 flex items-center">
              <Scan className="w-5 h-5 mr-2" />
              Scan QR Code
            </h2>
            <div className="overflow-hidden rounded-lg">
              <div id="reader" className="w-full"></div>
            </div>
          </div>

          {/* Manual Entry & Results */}
          <div className="space-y-6">
            <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-200">
              <h2 className="text-lg font-semibold text-gray-900 mb-4 flex items-center">
                <Search className="w-5 h-5 mr-2" />
                Manual Entry
              </h2>
              <form onSubmit={handleManualSubmit} className="flex gap-2">
                <input
                  type="text"
                  placeholder="Enter QR Code Data"
                  value={manualCode}
                  onChange={(e) => setManualCode(e.target.value)}
                  className="flex-1 border border-gray-300 rounded-md shadow-sm py-2 px-3 text-black placeholder:text-black focus:outline-none focus:ring-black focus:border-black sm:text-sm"
                />
                <button
                  type="submit"
                  disabled={verifying || !manualCode.trim()}
                  className="px-4 py-2 bg-black text-white rounded-md hover:bg-gray-800 disabled:bg-gray-400 transition-colors"
                >
                  Verify
                </button>
              </form>
            </div>

            {/* Result Card */}
            {scanResult && (
              <div
                className={`p-6 rounded-xl shadow-sm border ${
                  scanResult.success
                    ? "bg-green-50 border-green-200"
                    : "bg-red-50 border-red-200"
                }`}
              >
                <div className="flex items-start">
                  {scanResult.success ? (
                    <CheckCircle className="w-6 h-6 text-green-600 mr-3 flex-shrink-0" />
                  ) : (
                    <XCircle className="w-6 h-6 text-red-600 mr-3 flex-shrink-0" />
                  )}
                  <div>
                    <h3
                      className={`text-lg font-medium ${
                        scanResult.success ? "text-green-900" : "text-red-900"
                      }`}
                    >
                      {scanResult.success
                        ? "Verification Successful"
                        : "Verification Failed"}
                    </h3>
                    <p
                      className={`mt-1 ${
                        scanResult.success ? "text-green-700" : "text-red-700"
                      }`}
                    >
                      {scanResult.message}
                    </p>

                    {scanResult.success && scanResult.data && (
                      <div className="mt-4 bg-white bg-opacity-60 p-4 rounded-lg">
                        <p className="text-sm text-green-800">
                          <span className="font-semibold">Event:</span>{" "}
                          {scanResult.data.event.title}
                        </p>
                        <p className="text-sm text-green-800">
                          <span className="font-semibold">Student:</span>{" "}
                          {scanResult.data.user.name}
                        </p>
                        <p className="text-sm text-green-800">
                          <span className="font-semibold">Roll Number:</span>{" "}
                          {scanResult.data.user.rollNumber || "N/A"}
                        </p>
                      </div>
                    )}
                  </div>
                </div>

                <button
                  onClick={handleNextScan}
                  className="mt-6 w-full py-2 px-4 bg-black text-white rounded-lg font-medium hover:bg-gray-800 transition-colors"
                >
                  Scan Next
                </button>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
