import { Link, useLocation } from "wouter";
import LogoPng from "@assets/ChatGPT_Image_Jul_22,_2026,_10_36_42_AM_1784716629045.png";

export function Layout({ children }: { children: React.ReactNode }) {
  const [location] = useLocation();

  const links = [
    { href: "/", label: "Home" },
    { href: "/order", label: "Order Now" },
    { href: "/track", label: "Track Order" },
    { href: "/referral", label: "Refer & Earn" },
    { href: "/referral/dashboard", label: "Referral Dashboard" },
    { href: "/donate", label: "Donate" },
  ];

  return (
    <div className="min-h-[100dvh] flex flex-col font-sans selection:bg-primary selection:text-primary-foreground">
      {/* Navbar */}
      <header className="sticky top-0 z-50 w-full border-b bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60">
        <div className="container mx-auto px-4 h-16 flex items-center justify-between">
          <Link href="/" className="flex items-center gap-3 group">
            <div className="h-10 w-10 rounded-full overflow-hidden bg-black flex items-center justify-center border-2 border-primary group-hover:scale-105 transition-transform duration-300">
              <img src={LogoPng} alt="Apex Mushroom Logo" className="h-full w-full object-cover" />
            </div>
            <div className="flex flex-col">
              <span className="font-serif font-bold text-lg leading-tight tracking-tight text-foreground">Apex Mushroom Bread</span>
              <span className="text-[0.65rem] uppercase tracking-widest text-muted-foreground font-semibold">by Mcphoebe Enterprise</span>
            </div>
          </Link>

          <nav className="hidden md:flex items-center gap-6">
            {links.map((link) => (
              <Link
                key={link.href}
                href={link.href}
                className={`text-sm font-medium transition-colors hover:text-primary ${
                  location === link.href ? "text-primary" : "text-muted-foreground"
                }`}
              >
                {link.label}
              </Link>
            ))}
          </nav>

          <div className="flex items-center gap-3">
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="flex-1 flex flex-col">
        {children}
      </main>

      {/* Footer */}
      <footer className="bg-black text-white border-t-4 border-primary pt-16 pb-8">
        <div className="container mx-auto px-4">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-12 mb-12">
            <div>
              <div className="flex items-center gap-3 mb-6">
                <div className="h-12 w-12 rounded-full overflow-hidden bg-black flex items-center justify-center border-2 border-primary">
                  <img src={LogoPng} alt="Apex Mushroom Logo" className="h-full w-full object-cover" />
                </div>
                <div>
                  <h3 className="font-serif font-bold text-xl text-white">Apex Mushroom Bread</h3>
                  <p className="text-primary text-xs font-semibold uppercase tracking-widest">Mcphoebe Enterprise</p>
                </div>
              </div>
              <p className="text-gray-400 text-sm max-w-xs leading-relaxed">
                A proudly Ghanaian artisanal mushroom bread bakery by Mcphoebe Enterprise. We bake with love, community, and the finest ingredients.
              </p>
            </div>
            
            <div>
              <h4 className="font-serif font-bold text-lg mb-4 text-white">Quick Links</h4>
              <ul className="space-y-3">
                {links.map((link) => (
                  <li key={link.href}>
                    <Link href={link.href} className="text-gray-400 hover:text-primary text-sm transition-colors">
                      {link.label}
                    </Link>
                  </li>
                ))}
              </ul>
            </div>

            <div>
              <h4 className="font-serif font-bold text-lg mb-4 text-white">Contact Us</h4>
              <address className="not-italic text-sm text-gray-400 space-y-2">
                <p>Mcphoebe Enterprise</p>
                <p>Plot 1, Block B</p>
                <p>Tanoso Market Street</p>
                <p>Near the Despite Building</p>
                <p>Tanoso, Kumasi — Ghana</p>
                <p>GPS: AK-741-9466</p>
                <p className="text-primary font-serif italic text-lg mt-4">"Our Customer, Our Gold."</p>
              </address>
            </div>
          </div>
        </div>
      </footer>
      
      {/* Required Copyright Strip */}
      <div className="bg-white py-4 border-t-2 border-primary text-center">
        <p className="font-bold text-black text-sm uppercase tracking-wide">
          Copyright &copy; 2025 All Rights Reserved &mdash; Mcphoebe Enterprise &bull; Apex Mushroom Bread
        </p>
      </div>
    </div>
  );
}