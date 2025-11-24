import React from 'react';

// Demo data customized for "PestoFarm"
const aboutText = {
  paragraph1: 'PestoFarm is a premier AgriTech e-commerce platform dedicated to empowering farmers with access to genuine, high-quality agricultural inputs, including certified pesticides, seeds, and nutrients.',
  paragraph2: 'We leverage data-driven insights and a vast network of agronomists to ensure every farmer gets the right product for the right crop at the right time. Our mission is to increase farm productivity and contribute to sustainable agricultural growth.',
};

// --- SPLIT QUICK LINKS FOR 4-COLUMN LAYOUT ---
const quickLinksCol1 = [
  { name: 'About Us', href: '#' },
  { name: 'Expert Advice', href: '#' },
  { name: 'Return & Refund Policy', href: '#' },
  { name: 'Careers', href: '#' },
  { name: 'FAQ', href: '#' },
];

const quickLinksCol2 = [
  { name: 'Shop By Crop', href: '#' },
  { name: 'Privacy Policy', href: '#' },
  { name: 'Terms of Service', href: '#' },
  { name: 'Shipping Policy', href: '#' },
  { name: 'Sitemap', href: '#' },
];

// Inline SVG icons for social media (simplified to match the single-file constraint)
const socialIcons = [
  {
    name: 'Instagram',
    Icon: (props: React.SVGProps<SVGSVGElement>) => (
      <svg {...props} xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><rect width="20" height="20" x="2" y="2" rx="5" ry="5"/><path d="M16 11.37A4 4 0 1 1 12.63 8 4 4 0 0 1 16 11.37z"/><line x1="17.5" x2="17.51" y1="6.5" y2="6.5"/></svg>
    ),
    href: '#'
  },
  {
    name: 'Facebook',
    Icon: (props: React.SVGProps<SVGSVGElement>) => (
      <svg {...props} xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M18 2h-3a5 5 0 0 0-5 5v3H7v4h3v8h4v-8h3l1-4h-4V7a1 1 0 0 1 1-1h3z"/></svg>
    ),
    href: '#'
  },
  {
    name: 'YouTube',
    Icon: (props: React.SVGProps<SVGSVGElement>) => (
      <svg {...props} xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M2.5 17.5V6.5L12 12 21.5 6.5v11L12 12l-9.5 5.5zM21.5 6.5L12 12 2.5 6.5"/></svg>
    ),
    href: '#'
  },
  {
    name: 'LinkedIn',
    Icon: (props: React.SVGProps<SVGSVGElement>) => (
      <svg {...props} xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M16 8a6 6 0 0 1 6 6v7h-4v-7a2 2 0 0 0-2-2 2 2 0 0 0-2 2v7h-4v-7a6 6 0 0 1 6-6z"/><rect width="4" height="12" x="2" y="9"/><circle cx="4" cy="4" r="2"/></svg>
    ),
    href: '#'
  },
];

const Footer = () => {
  // Use a custom dark green color for the background, similar to the image
  const bgColor = '#344e41';

  return (
    // Main footer container
    <footer id="footer" style={{ backgroundColor: bgColor }} className="min-h-96 py-12 px-6 sm:px-12 text-gray-200">
      <div className="max-w-7xl mx-auto">

        {/* Grid Layout for Desktop (4 columns) and Stacked Layout for Mobile */}
        {/* Changed md:grid-cols-3 to md:grid-cols-4 */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-10 lg:gap-16">

          {/* Column 1: About PestoFarm & Mission (Spans 1 column on desktop) */}
          <div className="col-span-1">
            <h2 className="text-4xl font-bold mb-6 text-white tracking-wider">
              PestoFarm <span className="text-lime-400">🌿</span>
            </h2>
            <p className="text-sm leading-relaxed mb-4">
              {aboutText.paragraph1}
            </p>
            <p className="text-sm leading-relaxed mb-8">
              {aboutText.paragraph2}
            </p>
          </div>

          {/* Column 2 & 3: Quick Links (Spans 2 columns on desktop) */}
          <div className="col-span-1 md:col-span-2">
            <h3 className="text-xl font-semibold mb-6 text-white border-b border-gray-600 pb-2">
              Quick Links
            </h3>
            {/* Inner grid for two columns of links on desktop */}
            <div className="grid grid-cols-2 gap-y-2 gap-x-12 text-sm">
              {/* Quick Links Column 1 */}
              <div>
                {quickLinksCol1.map((link) => (
                  <a
                    key={link.name}
                    href={link.href}
                    className="block py-1 hover:text-lime-400 transition-colors"
                  >
                    {link.name}
                  </a>
                ))}
              </div>
              {/* Quick Links Column 2 */}
              <div>
                {quickLinksCol2.map((link) => (
                  <a
                    key={link.name}
                    href={link.href}
                    className="block py-1 hover:text-lime-400 transition-colors"
                  >
                    {link.name}
                  </a>
                ))}
              </div>
            </div>
          </div>

          {/* Column 4: Contact Us & Missed Call/WhatsApp (Spans 1 column on desktop) */}
          <div className="col-span-1">
            <h3 className="text-xl font-semibold mb-6 text-white border-b border-gray-600 pb-2">
              Contact Us
            </h3>

            <div className="mb-6">
              <p className="text-sm mb-2">Missed Call to Order (24/7 Support):</p>
              <a
                href="tel:180030002434"
                className="inline-block py-2 px-4 rounded-lg bg-orange-500 hover:bg-orange-600 text-white font-bold text-lg transition-colors shadow-md"
              >
                1800 3000 2434
              </a>
            </div>

            <div className="mb-8">
              <p className="text-sm mb-2">Whatsapp (Instant Help):</p>
              <a
                href="https://wa.me/918050797979"
                className="inline-block py-2 px-4 rounded-lg bg-lime-500 hover:bg-lime-600 text-white font-bold text-lg transition-colors shadow-md"
              >
                +91 8050797979
              </a>
            </div>

            {/* Download Mobile App Section (Mock QR Code) */}
            <div>
                <p className="text-sm font-semibold text-white mb-2">Download Mobile App</p>
                <div className="w-28 h-28 bg-white p-1 rounded">
                    {/* Placeholder for QR code using a simple SVG pattern */}
                    <svg viewBox="0 0 100 100" xmlns="http://www.w3.org/2000/svg">
                        <rect width="100" height="100" fill="#fff"/>
                        <path fill="#000" d="M10 10h30v30H10z M60 10h30v30H60z M10 60h30v30H10z M45 45h10v10H45z M75 55h10v10H75z M25 75h10v10H25z"/>
                        <rect x="50" y="70" width="10" height="10" fill="#000"/>
                        <rect x="70" y="10" width="10" height="10" fill="#000"/>
                    </svg>
                </div>
            </div>
          </div>

        </div>

        {/* Separator and Social Media Icons (Bottom) */}
        <hr className="my-8 border-gray-700" />

        <div className="flex justify-between items-center flex-col sm:flex-row">

            {/* Copyright and Company Name */}
            <p className="text-xs text-gray-400 mb-4 sm:mb-0">
                &copy; {new Date().getFullYear()} PestoFarm. All rights reserved.
            </p>

            {/* Social Icons */}
            <div className="flex space-x-4">
                {socialIcons.map((item) => (
                    <a
                        key={item.name}
                        href={item.href}
                        target="_blank"
                        rel="noopener noreferrer"
                        aria-label={item.name}
                        className="text-gray-400 hover:text-lime-400 transition-colors"
                    >
                        <item.Icon className="w-6 h-6" />
                    </a>
                ))}
            </div>
        </div>

      </div>
    </footer>
  );
};

export default Footer;
