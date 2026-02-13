import { Link } from "react-router-dom";
import { Wifi } from "lucide-react";

export function Header() {
  return (
    <header className="border-b bg-card">
      <div className="container flex h-14 items-center gap-3">
        <Link to="/" className="flex items-center gap-2 font-bold text-lg text-primary">
          <Wifi className="h-5 w-5" />
          NetScope
        </Link>
        <span className="text-xs text-muted-foreground">WebRTC Network Simulator</span>
      </div>
    </header>
  );
}
