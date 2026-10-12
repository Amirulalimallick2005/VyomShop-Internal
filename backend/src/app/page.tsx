import Link from "next/link";
import { Store, ShieldCheck } from "lucide-react";

export const metadata = {
  title: "Vyom Shop - Dashboard Portal",
  description: "Seller and Admin dashboard for Vyom Shop",
};

export default function LandingPage() {
  return (
    <div className="min-h-screen bg-gradient-to-br from-orange-50 to-amber-50 flex items-center justify-center p-6">
      <div className="max-w-lg w-full">
        {/* Header */}
        <div className="text-center mb-12">
          <div className="inline-flex items-center justify-center w-20 h-20 rounded-2xl bg-orange-500 text-white mb-5 shadow-lg">
            <Store size={40} />
          </div>
          <h1 className="text-4xl font-bold text-gray-900 mb-2">Vyom Shop</h1>
          <p className="text-gray-500 text-lg">Select your portal to continue</p>
        </div>

        {/* Portal Cards */}
        <div className="grid grid-cols-1 gap-5">
          {/* Seller Portal */}
          <Link href="/seller/login">
            <div className="group relative bg-white rounded-2xl p-8 border border-gray-200 shadow-sm hover:shadow-xl hover:border-orange-300 transition-all duration-200 cursor-pointer">
              <div className="flex items-center gap-5">
                <div className="flex-shrink-0 w-14 h-14 rounded-xl bg-orange-100 group-hover:bg-orange-500 flex items-center justify-center transition-colors duration-200">
                  <Store size={28} className="text-orange-500 group-hover:text-white transition-colors duration-200" />
                </div>
                <div>
                  <h2 className="text-xl font-semibold text-gray-900 mb-1">Seller Dashboard</h2>
                  <p className="text-gray-500 text-sm">
                    Manage your shop, products, and track analytics
                  </p>
                </div>
                <div className="ml-auto text-gray-300 group-hover:text-orange-400 transition-colors duration-200">
                  <svg width="20" height="20" viewBox="0 0 20 20" fill="currentColor">
                    <path fillRule="evenodd" d="M7.293 14.707a1 1 0 010-1.414L10.586 10 7.293 6.707a1 1 0 011.414-1.414l4 4a1 1 0 010 1.414l-4 4a1 1 0 01-1.414 0z" clipRule="evenodd" />
                  </svg>
                </div>
              </div>
              <div className="mt-5 flex flex-wrap gap-2">
                {["Manage Products", "Shop Profile", "Analytics", "Credit Wallet"].map((tag) => (
                  <span key={tag} className="px-3 py-1 rounded-full text-xs font-medium bg-orange-50 text-orange-600">
                    {tag}
                  </span>
                ))}
              </div>
            </div>
          </Link>

          {/* Admin Portal */}
          <Link href="/admin/login">
            <div className="group relative bg-white rounded-2xl p-8 border border-gray-200 shadow-sm hover:shadow-xl hover:border-indigo-300 transition-all duration-200 cursor-pointer">
              <div className="flex items-center gap-5">
                <div className="flex-shrink-0 w-14 h-14 rounded-xl bg-indigo-100 group-hover:bg-indigo-600 flex items-center justify-center transition-colors duration-200">
                  <ShieldCheck size={28} className="text-indigo-600 group-hover:text-white transition-colors duration-200" />
                </div>
                <div>
                  <h2 className="text-xl font-semibold text-gray-900 mb-1">Super Admin</h2>
                  <p className="text-gray-500 text-sm">
                    Platform management, approvals and oversight
                  </p>
                </div>
                <div className="ml-auto text-gray-300 group-hover:text-indigo-400 transition-colors duration-200">
                  <svg width="20" height="20" viewBox="0 0 20 20" fill="currentColor">
                    <path fillRule="evenodd" d="M7.293 14.707a1 1 0 010-1.414L10.586 10 7.293 6.707a1 1 0 011.414-1.414l4 4a1 1 0 010 1.414l-4 4a1 1 0 01-1.414 0z" clipRule="evenodd" />
                  </svg>
                </div>
              </div>
              <div className="mt-5 flex flex-wrap gap-2">
                {["Approve Shops", "Manage Users", "Transactions", "Platform Metrics"].map((tag) => (
                  <span key={tag} className="px-3 py-1 rounded-full text-xs font-medium bg-indigo-50 text-indigo-600">
                    {tag}
                  </span>
                ))}
              </div>
            </div>
          </Link>
        </div>

        <p className="text-center text-xs text-gray-400 mt-8">
          © {new Date().getFullYear()} Vyom Shop. All rights reserved.
        </p>
      </div>
    </div>
  );
}
