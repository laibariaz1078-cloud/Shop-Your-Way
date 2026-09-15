"use client";

import { useState } from "react";

const sections = [
  {
    heading: "Manage My Account",
    items: ["My Profile", "Address Book", "My Payment Options"],
  },
  {
    heading: "My Orders",
    items: ["My Returns", "My Cancellations"],
  },
  {
    heading: "My WishList",
    items: [],
  },
];

export default function AccountSidebar() {
  const [active, setActive] = useState("My Profile");

  return (
    <nav className="flex w-64 shrink-0 flex-col gap-6">
      {sections.map((section) => (
        <div key={section.heading} className="flex flex-col gap-3">
          <h4 className="text-base font-medium text-black">
            {section.heading}
          </h4>
          {section.items.length > 0 && (
            <div className="flex flex-col gap-2 pl-9">
              {section.items.map((item) => (
                <button
                  key={item}
                  type="button"
                  onClick={() => setActive(item)}
                  className={`text-left text-base font-normal transition-colors ${
                    active === item ? "text-[#DB4444]" : "text-black/50 hover:text-black"
                  }`}
                >
                  {item}
                </button>
              ))}
            </div>
          )}
        </div>
      ))}
    </nav>
  );
}