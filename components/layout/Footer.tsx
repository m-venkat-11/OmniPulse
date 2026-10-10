import Link from "next/link";

const footerLinks = {
  Product: [
    { label: "Platform overview", href: "#platform" },
    { label: "Regional intelligence", href: "#solutions" },
    { label: "Brand safety", href: "#solutions" },
    { label: "Creator matching", href: "#solutions" },
    { label: "Analytics", href: "#solutions" },
  ],
  Company: [
    { label: "About", href: "#" },
    { label: "Careers", href: "#" },
    { label: "Blog", href: "#" },
    { label: "Contact", href: "#" },
  ],
  Legal: [
    { label: "Privacy policy", href: "#" },
    { label: "Terms of service", href: "#" },
    { label: "Cookie policy", href: "#" },
    { label: "Data processing", href: "#" },
  ],
};

export function Footer() {
  return (
    <footer className="bg-forest text-ivory/80" aria-labelledby="footer-heading">
      <h2 id="footer-heading" className="sr-only">Footer</h2>
      <div className="max-w-7xl mx-auto px-6 lg:px-8 pt-16 pb-10">
        {/* Top: brand + links */}
        <div className="grid grid-cols-1 lg:grid-cols-5 gap-12 pb-12 border-b border-ivory/10">
          {/* Brand */}
          <div className="lg:col-span-2">
            <div className="flex items-center gap-2.5 mb-4">
              <span className="w-7 h-7 rounded-md bg-ivory/10 flex items-center justify-center shrink-0">
                <svg viewBox="0 0 20 20" fill="none" className="w-4 h-4">
                  <circle cx="10" cy="10" r="7" stroke="#B39A67" strokeWidth="1.2" />
                  <ellipse cx="10" cy="10" rx="4" ry="7" stroke="#DCE5D9" strokeWidth="0.8" strokeOpacity="0.7" />
                  <ellipse cx="10" cy="10" rx="7" ry="2.5" stroke="#DCE5D9" strokeWidth="0.8" strokeOpacity="0.5" />
                </svg>
              </span>
              <span className="font-serif font-semibold text-ivory text-lg">
                Braco <span className="text-brass">OmniPulse</span>
              </span>
            </div>
            <p className="text-sm text-ivory/60 leading-relaxed max-w-xs">
              AI-assisted regional campaign intelligence for Indian brands, agencies and creators.
              Built for the diversity of India&apos;s markets.
            </p>
            <p className="mt-4 text-2xs text-ivory/40 uppercase tracking-widest">
              Demo mode — no real data is stored
            </p>
          </div>

          {/* Links */}
          {Object.entries(footerLinks).map(([group, links]) => (
            <div key={group}>
              <h3 className="text-xs font-semibold uppercase tracking-widest text-ivory/40 mb-4">{group}</h3>
              <ul className="space-y-2.5">
                {links.map((l) => (
                  <li key={l.label}>
                    <Link
                      href={l.href}
                      className="text-sm text-ivory/60 hover:text-ivory transition-colors duration-150"
                    >
                      {l.label}
                    </Link>
                  </li>
                ))}
              </ul>
            </div>
          ))}
        </div>

        {/* Bottom */}
        <div className="pt-8 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
          <p className="text-xs text-ivory/40">
            &copy; {new Date().getFullYear()} Braco OmniPulse. All rights reserved.
          </p>
          <p className="text-xs text-ivory/30">
            Automated checks are not legal certification. All AI outputs require human review.
          </p>
        </div>
      </div>
    </footer>
  );
}
