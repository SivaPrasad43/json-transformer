import Link from "next/link";
import { Button } from "@/components/ui/button";

export function Navbar() {
  return (
    <nav className="fixed top-0 left-0 right-0 bg-black z-50">
      <div className="border-b-1 border-gray-800 mx-auto px-4 h-16 flex items-center justify-between">
        <Link href="/" className="font-semibold text-lg text-muted">
          JSON Transformer
        </Link>
        
        <div className="flex items-center gap-6">
          <Link href="/" className="text-sm text-muted-foreground hover:text-muted transition-colors">
            Home
          </Link>
          <Link href="/dashboard" className="text-sm text-muted-foreground hover:text-muted transition-colors">
            Dashboard
          </Link>
          <Button variant="default" size="sm">
            Get Started
          </Button>
        </div>
      </div>
    </nav>
  );
}
