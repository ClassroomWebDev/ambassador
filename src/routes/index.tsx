import React, { useState, useEffect } from "react";
import { createFileRoute, Link } from "@tanstack/react-router";

export const Route = createFileRoute("/")({
  component: Homepage,
});
import {
  Users,
  Award,
  BookOpen,
  Calendar,
  ArrowRight,
  CheckCircle2,
  Bell,
  Clock,
  ShieldCheck,
  MapPin,
  Phone,
  Globe,
} from "lucide-react";

export default function Homepage() {
  // Countdown Timer State
  const [timeLeft, setTimeLeft] = useState({
    days: 12,
    hours: 8,
    minutes: 45,
    seconds: 30,
  });

  useEffect(() => {
    const timer = setInterval(() => {
      setTimeLeft((prev) => {
        if (prev.seconds > 0) return { ...prev, seconds: prev.seconds - 1 };
        if (prev.minutes > 0) return { ...prev, minutes: 59, seconds: 59 };
        if (prev.hours > 0) return { ...prev, hours: prev.hours - 1, minutes: 59, seconds: 59 };
        if (prev.days > 0) return { ...prev, days: prev.days - 1, hours: 23, minutes: 59, seconds: 59 };
        return prev;
      });
    }, 1000);
    return () => clearInterval(timer);
  }, []);

  return (
    <div className="min-h-screen bg-[#FAFAFA] text-slate-900 font-sans flex flex-col justify-between">
      {/* Top Navbar */}
      <header className="sticky top-0 z-50 bg-white/90 backdrop-blur-md border-b border-slate-200">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-16 flex items-center justify-between">
          <div className="flex items-center space-x-3">
            <div className="w-10 h-10 rounded-lg bg-[#991B1B] text-white flex items-center justify-center font-bold text-lg shadow-sm">
              CA
            </div>
            <div>
              <span className="font-bold text-lg tracking-tight text-slate-900 block leading-tight">
                Classroom Ambassador
              </span>
              <span className="text-xs text-slate-500 font-medium">Empowering Campus Leaders</span>
            </div>
          </div>

          <div className="flex items-center space-x-3">
            <Link
              to="/login"
              className="inline-flex items-center justify-center px-4 py-2 rounded-lg text-sm font-semibold bg-[#991B1B] text-white hover:bg-red-800 transition-colors shadow-sm"
            >
              Sign In
            </Link>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="flex-1">
        {/* Hero Section */}
        <section className="py-16 md:py-24 px-4 sm:px-6 lg:px-8 max-w-5xl mx-auto text-center">
          <div className="inline-flex items-center space-x-2 px-3 py-1 rounded-full bg-red-50 border border-red-100 text-[#991B1B] text-xs font-semibold uppercase tracking-wider mb-6">
            <ShieldCheck className="w-4 h-4" />
            <span>Official Leadership Platform</span>
          </div>

          <h1 className="text-4xl sm:text-5xl lg:text-6xl font-extrabold text-slate-900 tracking-tight leading-tight mb-6">
            Classroom <span className="text-[#991B1B]">Ambassador</span> Program
          </h1>

          <p className="text-base sm:text-lg text-slate-600 max-w-2xl mx-auto mb-10 leading-relaxed">
            Empowering youth leadership & excellence across campuses. Track your performance, attend masterclasses, earn
            points, and build your executive career.
          </p>

          <div className="flex flex-col sm:flex-row items-center justify-center gap-4">
            <Link
              to="/login"
              className="w-full sm:w-auto inline-flex items-center justify-center px-6 py-3.5 rounded-xl font-semibold bg-[#991B1B] text-white hover:bg-red-800 transition shadow-md group"
            >
              Access Portal
              <ArrowRight className="ml-2 w-4 h-4 group-hover:translate-x-1 transition-transform" />
            </Link>
          </div>
        </section>

        {/* Live Event Countdown Banner */}
        <section className="max-w-4xl mx-auto px-4 sm:px-6 mb-16">
          <div className="bg-white border border-slate-200 rounded-2xl p-6 sm:p-8 shadow-sm">
            <div className="flex flex-col md:flex-row items-center justify-between gap-6">
              <div>
                <div className="flex items-center space-x-2 text-[#991B1B] font-semibold text-sm mb-1">
                  <Clock className="w-4 h-4" />
                  <span>Next Major Campus Meetup</span>
                </div>
                <h2 className="text-xl font-bold text-slate-900">National Ambassador Conference 2026</h2>
              </div>

              {/* Countdown Digits */}
              <div className="flex items-center space-x-3">
                {[
                  { label: "Days", val: timeLeft.days },
                  { label: "Hours", val: timeLeft.hours },
                  { label: "Mins", val: timeLeft.minutes },
                  { label: "Secs", val: timeLeft.seconds },
                ].map((item, idx) => (
                  <div
                    key={idx}
                    className="bg-slate-50 border border-slate-200 rounded-xl p-3 w-16 text-center shadow-inner"
                  >
                    <span className="block text-xl font-extrabold text-slate-900 font-mono">
                      {String(item.val).padStart(2, "0")}
                    </span>
                    <span className="block text-[10px] uppercase font-bold text-slate-500 tracking-wider">
                      {item.label}
                    </span>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </section>

        {/* Feature Overview Cards */}
        <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-10">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <div className="bg-white border border-slate-200 rounded-2xl p-6 shadow-sm">
              <div className="w-12 h-12 rounded-xl bg-red-50 text-[#991B1B] flex items-center justify-center mb-4">
                <BookOpen className="w-6 h-6" />
              </div>
              <h2 className="text-lg font-bold text-slate-900 mb-2">Learning Points</h2>
              <p className="text-sm text-slate-600 leading-relaxed">
                Join scheduled masterclasses and interactive sessions. Attendance marked by your Coordinator credits
                direct learning points.
              </p>
            </div>

            <div className="bg-white border border-slate-200 rounded-2xl p-6 shadow-sm">
              <div className="w-12 h-12 rounded-xl bg-slate-100 text-slate-900 flex items-center justify-center mb-4">
                <Award className="w-6 h-6" />
              </div>
              <h2 className="text-lg font-bold text-slate-900 mb-2">Leadership Points</h2>
              <p className="text-sm text-slate-600 leading-relaxed">
                Drive verified course enrollments across your campus at exclusive Student Special Prices to climb the
                centralized Leaderboard.
              </p>
            </div>

            <div className="bg-white border border-slate-200 rounded-2xl p-6 shadow-sm">
              <div className="w-12 h-12 rounded-xl bg-red-50 text-[#991B1B] flex items-center justify-center mb-4">
                <Users className="w-6 h-6" />
              </div>
              <h2 className="text-lg font-bold text-slate-900 mb-2">Hierarchical Support</h2>
              <p className="text-sm text-slate-600 leading-relaxed">
                Access your designated Coordinator, Mentor, and Company Support Manager directly from your private
                support dashboard.
              </p>
            </div>
          </div>
        </section>
      </main>

      {/* Footer */}
      <footer className="bg-white border-t border-slate-200 py-8 mt-16">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 flex flex-col sm:flex-row items-center justify-between gap-4 text-xs text-slate-500">
          <p>© 2026 Classroom Ambassador Program. All rights reserved.</p>
          <div className="flex items-center space-x-6">
            <span>Support Helpline: Available in User Dashboard</span>
          </div>
        </div>
      </footer>
    </div>
  );
}
