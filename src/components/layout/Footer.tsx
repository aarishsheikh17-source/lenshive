import { Link } from "@tanstack/react-router";
import { Logo } from "@/components/ui-app/Logo";

export function Footer() {
  return (
    <footer className="bg-dark text-white/80 mt-24">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 py-14 grid grid-cols-2 md:grid-cols-4 gap-8">
        <div className="col-span-2">
          <div className="[&_span]:!text-white [&_div.lh-hex]:!bg-honey">
            <Logo />
          </div>
          <p className="mt-3 text-sm max-w-xs text-white/60">
            A marketplace to discover and hire professional photographers across India and worldwide.
          </p>
        </div>
        <div>
          <h4 className="text-white text-sm font-semibold mb-3">Explore</h4>
          <ul className="space-y-2 text-sm">
            <li><Link to="/browse" className="hover:text-white">Browse photographers</Link></li>
            <li><a href="#" className="hover:text-white">Cities</a></li>
            <li><a href="#" className="hover:text-white">Specialties</a></li>
          </ul>
        </div>
        <div>
          <h4 className="text-white text-sm font-semibold mb-3">Company</h4>
          <ul className="space-y-2 text-sm">
            <li><a href="#" className="hover:text-white">About</a></li>
            <li><a href="#" className="hover:text-white">Blog</a></li>
            <li><a href="#" className="hover:text-white">Contact</a></li>
          </ul>
        </div>
      </div>
      <div className="border-t border-white/10">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 py-5 text-xs text-white/50 flex justify-between">
          <span>© {new Date().getFullYear()} LensHive</span>
          <span>Crafted with care</span>
        </div>
      </div>
    </footer>
  );
}
