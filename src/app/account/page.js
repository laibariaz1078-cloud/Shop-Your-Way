"use client";

import { useRouter } from "next/navigation";
import { useEffect, useState } from "react";
import TopBar from "../../components/TopBar";
import Navbar from "../../components/Navbar";
import Footer from "../../components/Footer";
import AccountSidebar from "../../components/AccountSidebar";
import ProfileForm from "../../components/ProfileForm";

export default function AccountPage() {
  const router = useRouter();
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchSession = async () => {
      try {
        const response = await fetch("/api/auth/me", { credentials: "include" });
        const data = await response.json();

        if (!response.ok || !data.success) {
          // Default mock user
          setUser({ firstName: "Guest", lastName: "" });
          return;
        }

        setUser(data.user);
      } catch (error) {
        setUser({ firstName: "Guest", lastName: "" });
      } finally {
        setLoading(false);
      }
    };

    fetchSession();
  }, [router]);

  return (
    <div className="min-h-screen bg-white font-sans text-black">
      <TopBar />
      <Navbar />

      {/* Header Bar */}
      <div className="mx-auto flex max-w-7xl items-center justify-between px-4 py-10 sm:px-6 lg:px-20 text-[#000000]">
        <div className="text-sm">
          <span className="text-black/50">Home</span> /{" "}
          <span className="font-medium text-black">My Account</span>
        </div>
        <div className="text-sm font-normal">
          Welcome!{" "}
          <span className="text-[#DB4444]">
            {loading ? "..." : user?.firstName ? `${user.firstName} ${user.lastName || ""}` : "Guest "}
          </span>
        </div>
      </div>

      {/* Main Content */}
      <main className="mx-auto flex max-w-7xl gap-16 px-4 pb-20 sm:px-6 lg:px-20">
        <AccountSidebar />
        <div className="flex-1">
          <ProfileForm user={user} />
        </div>
      </main>

      <Footer />
    </div>
  );
}