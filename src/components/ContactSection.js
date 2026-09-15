"use client";

import { Phone, Mail } from "lucide-react";

export default function ContactSection() {
  const handleSubmit = (e) => {
    e.preventDefault();
  };

  return (
    <div className="mx-auto max-w-7xl py-10">
      {/* Breadcrumb Navigation */}
      

      <div className="grid grid-cols-1 gap-8 lg:grid-cols-3">
        {/* Left Side: Contact Information Card */}
        <div className="flex flex-col gap-8 rounded-sm bg-white p-8 shadow-[0_1px_13px_0_rgba(0,0,0,0.05)]">
          {/* Call To Us Section */}
          <div className="flex flex-col gap-4 border-b border-black/20 pb-8">
            <div className="flex items-center gap-4">
              <div className="flex h-10 w-10 items-center justify-center rounded-full bg-[#DB4444] text-white">
                <Phone className="h-5 w-5" />
              </div>
              <h3 className="text-base font-medium text-black">Call To Us</h3>
            </div>
            <p className="text-sm font-normal text-black">
              We are available 24/7, 7 days a week.
            </p>
            <p className="text-sm font-normal text-black">
              Phone: +8801611112222
            </p>
          </div>

          {/* Write To Us Section */}
          <div className="flex flex-col gap-4">
            <div className="flex items-center gap-4">
              <div className="flex h-10 w-10 items-center justify-center rounded-full bg-[#DB4444] text-white">
                <Mail className="h-5 w-5" />
              </div>
              <h3 className="text-base font-medium text-black">Write To US</h3>
            </div>
            <p className="text-sm font-normal text-black">
              Fill out our form and we will contact you within 24 hours.
            </p>
            <p className="text-sm font-normal text-black">
              Emails: customer@exclusive.com
            </p>
            <p className="text-sm font-normal text-black">
              Emails: support@exclusive.com
            </p>
          </div>
        </div>

        {/* Right Side: Contact Form */}
        <form
          onSubmit={handleSubmit}
          className="flex flex-col gap-8 rounded-sm bg-white p-8 shadow-[0_1px_13px_0_rgba(0,0,0,0.05)] lg:col-span-2"
        >
          {/* Input Fields Grid */}
          <div className="grid grid-cols-1 gap-4 sm:grid-cols-3">
            <div className="relative">
              <input
                type="text"
                required
                placeholder="Your Name *"
                className="w-full rounded bg-[#F5F5F5] px-4 py-3.5 text-sm font-normal text-black outline-none placeholder:text-black/50"
              />
            </div>
            <div className="relative">
              <input
                type="email"
                required
                placeholder="Your Email *"
                className="w-full rounded bg-[#F5F5F5] px-4 py-3.5 text-sm font-normal text-black outline-none placeholder:text-black/50"
              />
            </div>
            <div className="relative">
              <input
                type="tel"
                required
                placeholder="Your Phone *"
                className="w-full rounded bg-[#F5F5F5] px-4 py-3.5 text-sm font-normal text-black outline-none placeholder:text-black/50"
              />
            </div>
          </div>

          {/* Message Textarea */}
          <textarea
            placeholder="Your Massage"
            rows={7}
            className="w-full resize-none rounded bg-[#F5F5F5] p-4 text-sm font-normal text-black outline-none placeholder:text-black/50"
          />

          {/* Send Message Button */}
          <div className="flex justify-end">
            <button
              type="submit"
              className="rounded bg-[#DB4444] px-12 py-4 text-base font-medium text-white transition-colors duration-200 hover:bg-[#e03a3a] active:scale-95"
            >
              Send Massage
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}