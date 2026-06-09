import { Link } from "react-router";
import { trpc } from "@/providers/trpc";
import { useState } from "react";
import {
  Mail,
  Phone,
  MapPin,
  Facebook,
  Instagram,
  Twitter,
  ArrowRight,
  MessageCircle,
} from "lucide-react";
import { toast } from "sonner";

export default function Footer() {
  const [email, setEmail] = useState("");
  const subscribeMutation = trpc.contact.subscribe.useMutation({
    onSuccess: (data) => {
      toast.success(data.message);
      setEmail("");
    },
    onError: () => {
      toast.error("Failed to subscribe. Please try again.");
    },
  });

  const handleSubscribe = (e: React.FormEvent) => {
    e.preventDefault();
    if (email.trim()) {
      subscribeMutation.mutate({ email: email.trim() });
    }
  };

  return (
    <footer className="bg-black text-white">
      {/* Newsletter */}
      <div className="border-b border-gray-800">
        <div className="max-w-7xl mx-auto px-4 py-12">
          <div className="flex flex-col md:flex-row items-center justify-between gap-6">
            <div>
              <h3 className="text-2xl font-bold mb-2">Join Our Newsletter</h3>
              <p className="text-gray-400">
                Subscribe to get exclusive offers and updates on new collections
              </p>
            </div>
            <form onSubmit={handleSubscribe} className="flex w-full md:w-auto gap-2">
              <input
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="Enter your email"
                className="flex-1 md:w-72 px-4 py-3 bg-gray-900 border border-gray-700 rounded-lg focus:outline-none focus:ring-2 focus:ring-amber-500 text-white placeholder:text-gray-500"
                required
              />
              <button
                type="submit"
                disabled={subscribeMutation.isPending}
                className="px-6 py-3 bg-amber-500 hover:bg-amber-600 text-black font-medium rounded-lg transition-colors flex items-center gap-2 disabled:opacity-50"
              >
                Subscribe
                <ArrowRight className="w-4 h-4" />
              </button>
            </form>
          </div>
        </div>
      </div>

      {/* Main Footer */}
      <div className="max-w-7xl mx-auto px-4 py-12">
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-8">
          {/* Company Info */}
          <div>
            <div className="flex items-center gap-2 mb-4">
              <div className="w-10 h-10 bg-amber-500 flex items-center justify-center">
                <span className="text-black font-bold text-lg">K</span>
              </div>
              <div>
                <h4 className="font-bold tracking-wider">KARIMI</h4>
                <p className="text-[10px] tracking-[0.2em] text-gray-500">
                  GARMENTS
                </p>
              </div>
            </div>
            <p className="text-gray-400 text-sm mb-4">
              Premium quality garments crafted with precision and care. Serving
              customers worldwide since 1995.
            </p>
            <div className="flex gap-3">
              <a
                href="#"
                className="w-9 h-9 bg-gray-800 hover:bg-amber-500 rounded-full flex items-center justify-center transition-colors group"
              >
                <Facebook className="w-4 h-4 text-gray-400 group-hover:text-black" />
              </a>
              <a
                href="#"
                className="w-9 h-9 bg-gray-800 hover:bg-amber-500 rounded-full flex items-center justify-center transition-colors group"
              >
                <Instagram className="w-4 h-4 text-gray-400 group-hover:text-black" />
              </a>
              <a
                href="#"
                className="w-9 h-9 bg-gray-800 hover:bg-amber-500 rounded-full flex items-center justify-center transition-colors group"
              >
                <Twitter className="w-4 h-4 text-gray-400 group-hover:text-black" />
              </a>
            </div>
          </div>

          {/* Quick Links */}
          <div>
            <h4 className="font-bold mb-4">Quick Links</h4>
            <ul className="space-y-2">
              {[
                { label: "Home", href: "/" },
                { label: "Shop All", href: "/products" },
                { label: "New Arrivals", href: "/products?sort=newest" },
                { label: "Best Sellers", href: "/products?filter=bestseller" },
                { label: "About Us", href: "/about" },
              ].map((link) => (
                <li key={link.label}>
                  <Link
                    to={link.href}
                    className="text-gray-400 hover:text-amber-500 text-sm transition-colors"
                  >
                    {link.label}
                  </Link>
                </li>
              ))}
            </ul>
          </div>

          {/* Customer Service */}
          <div>
            <h4 className="font-bold mb-4">Customer Service</h4>
            <ul className="space-y-2">
              {[
                { label: "Contact Us", href: "/contact" },
                { label: "Shipping Info", href: "/about#shipping" },
                { label: "Returns Policy", href: "/about#returns" },
                { label: "Size Guide", href: "/about#sizeguide" },
                { label: "FAQ", href: "/about#faq" },
              ].map((link) => (
                <li key={link.label}>
                  <Link
                    to={link.href}
                    className="text-gray-400 hover:text-amber-500 text-sm transition-colors"
                  >
                    {link.label}
                  </Link>
                </li>
              ))}
            </ul>
          </div>

          {/* Contact Info */}
          <div>
            <h4 className="font-bold mb-4">Contact Us</h4>
            <ul className="space-y-3">
              <li className="flex items-start gap-3 text-sm text-gray-400">
                <MapPin className="w-5 h-5 text-amber-500 shrink-0 mt-0.5" />
                <span>
                  123 Garment District
                  <br />
                  Kabul, Afghanistan
                </span>
              </li>
              <li>
                <a
                  href="tel:+93123456789"
                  className="flex items-center gap-3 text-sm text-gray-400 hover:text-amber-500 transition-colors"
                >
                  <Phone className="w-5 h-5 text-amber-500" />
                  +93 123 456 789
                </a>
              </li>
              <li>
                <a
                  href="mailto:info@karimigarments.com"
                  className="flex items-center gap-3 text-sm text-gray-400 hover:text-amber-500 transition-colors"
                >
                  <Mail className="w-5 h-5 text-amber-500" />
                  info@karimigarments.com
                </a>
              </li>
              <li>
                <a
                  href="https://wa.me/93123456789"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="flex items-center gap-3 text-sm text-gray-400 hover:text-green-500 transition-colors"
                >
                  <MessageCircle className="w-5 h-5 text-green-500" />
                  WhatsApp Support
                </a>
              </li>
            </ul>
          </div>
        </div>
      </div>

      {/* Bottom Bar */}
      <div className="border-t border-gray-800">
        <div className="max-w-7xl mx-auto px-4 py-4">
          <div className="flex flex-col sm:flex-row justify-between items-center gap-2 text-sm text-gray-500">
            <p>&copy; {new Date().getFullYear()} Karimi Garments. All rights reserved.</p>
            <div className="flex gap-4">
              <Link to="#" className="hover:text-white transition-colors">
                Privacy Policy
              </Link>
              <Link to="#" className="hover:text-white transition-colors">
                Terms of Service
              </Link>
            </div>
          </div>
        </div>
      </div>
    </footer>
  );
}
