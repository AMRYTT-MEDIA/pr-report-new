import { Button } from "@/components/ui/button";
import Link from "next/link";

const Header = () => (
  <header className="bg-white shadow-sm border-b">
    <div className="container mx-auto px-4 py-4">
      <div className="flex items-center justify-between">
        <div className="flex items-center space-x-2">
          <div className="w-8 h-8 bg-gradient-primary rounded-lg flex items-center justify-center">
            <span className="text-white font-bold text-lg">G</span>
          </div>
          <span className="text-xl font-bold text-foreground">GUESTPOSTLINKS</span>
        </div>

        <nav className="hidden md:flex items-center space-x-8">
          <Link href="/" className="text-muted-foreground hover:text-foreground transition-colors">
            Home
          </Link>
          <Link href="#services" className="text-muted-foreground hover:text-foreground transition-colors">
            Services
          </Link>
          <Link href="#packages" className="text-muted-foreground hover:text-foreground transition-colors">
            Packages
          </Link>
          <Link href="#sites" className="text-muted-foreground hover:text-foreground transition-colors">
            Sites
          </Link>
          <Link href="#tools" className="text-muted-foreground hover:text-foreground transition-colors">
            Tools
          </Link>
          <Link href="/login">
            <Button variant="cta">My Account</Button>
          </Link>
        </nav>
      </div>
    </div>
  </header>
);

export default Header;
