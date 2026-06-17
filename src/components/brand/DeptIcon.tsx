import {
  TrendingUp,
  Package,
  Headset,
  Truck,
  Users,
  Wallet,
  Megaphone,
  Server,
  Wrench,
  type LucideIcon,
} from "lucide-react";

const MAP: Record<string, LucideIcon> = {
  "trending-up": TrendingUp,
  package: Package,
  headset: Headset,
  truck: Truck,
  users: Users,
  wallet: Wallet,
  megaphone: Megaphone,
  server: Server,
};

export function DeptIcon({ name, className }: { name: string; className?: string }) {
  const Icon = MAP[name] ?? Wrench;
  return <Icon className={className} />;
}
