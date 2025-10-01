import { Facebook, Twitter, Linkedin, Mail } from "lucide-react";
import Link from "next/link";

const Footer = () => (
  <footer className="bg-foreground text-white py-16">
    <div className="container mx-auto px-4">
      <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-8">
        <div className="space-y-4">
          <div className="flex items-center space-x-2">
            <div className="w-8 h-8 bg-gradient-primary rounded-lg flex items-center justify-center">
              <span className="text-white font-bold text-lg">G</span>
            </div>
            <span className="text-xl font-bold">GUESTPOSTLINKS</span>
          </div>
          <p className="text-white/80 leading-relaxed">
            Premium link building and PR distribution agency helping businesses grow their online presence through
            strategic media coverage and quality backlinks.
          </p>
          <div className="flex space-x-4">
            <Facebook className="h-5 w-5 text-white/60 hover:text-white cursor-pointer transition-colors" />
            <Twitter className="h-5 w-5 text-white/60 hover:text-white cursor-pointer transition-colors" />
            <Linkedin className="h-5 w-5 text-white/60 hover:text-white cursor-pointer transition-colors" />
            <Mail className="h-5 w-5 text-white/60 hover:text-white cursor-pointer transition-colors" />
          </div>
        </div>

        <div>
          <h3 className="text-lg font-semibold mb-4">Services</h3>
          <ul className="space-y-2 text-white/80">
            <li>
              <Link href="#services" className="hover:text-white transition-colors">
                Press Release Distribution
              </Link>
            </li>
            <li>
              <Link href="#services" className="hover:text-white transition-colors">
                Guest Posting Service
              </Link>
            </li>
            <li>
              <Link href="#services" className="hover:text-white transition-colors">
                Local Citation Building
              </Link>
            </li>
            <li>
              <Link href="#services" className="hover:text-white transition-colors">
                Link Building Packages
              </Link>
            </li>
          </ul>
        </div>

        <div>
          <h3 className="text-lg font-semibold mb-4">Resources</h3>
          <ul className="space-y-2 text-white/80">
            <li>
              <Link href="#packages" className="hover:text-white transition-colors">
                Pricing Plans
              </Link>
            </li>
            <li>
              <Link href="#sites" className="hover:text-white transition-colors">
                Publisher Sites
              </Link>
            </li>
            <li>
              <Link href="#tools" className="hover:text-white transition-colors">
                Sample Reports
              </Link>
            </li>
            <li>
              <Link href="#tools" className="hover:text-white transition-colors">
                Blog & Guides
              </Link>
            </li>
          </ul>
        </div>

        <div>
          <h3 className="text-lg font-semibold mb-4">Support</h3>
          <ul className="space-y-2 text-white/80">
            <li>
              <Link href="#contact" className="hover:text-white transition-colors">
                Contact Us
              </Link>
            </li>
            <li>
              <Link href="#faq" className="hover:text-white transition-colors">
                FAQ
              </Link>
            </li>
            <li>
              <Link href="/terms" className="hover:text-white transition-colors">
                Terms of Service
              </Link>
            </li>
            <li>
              <Link href="/privacy" className="hover:text-white transition-colors">
                Privacy Policy
              </Link>
            </li>
          </ul>
        </div>
      </div>

      <div className="border-t border-white/20 mt-12 pt-8 text-center text-white/60">
        <p>&copy; 2024 GUESTPOSTLINKS. All rights reserved. Premium Link Building & PR Distribution Agency.</p>
      </div>
    </div>
  </footer>
);

export default Footer;
