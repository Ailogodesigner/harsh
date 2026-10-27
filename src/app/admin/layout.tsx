import NextLink from "next/link";
import { getCurrentUser } from "@/lib/auth";
import { redirect } from "next/navigation";
import {
  Shield,
  LayoutDashboard,
  ShoppingBag,
  ShoppingCart,
  Users,
  Settings,
  FileText,
  ArrowLeft,
  Server,
  Gamepad2,
  Bell,
  Trophy,
  MessageSquare,
  LifeBuoy,
  UserCheck,
} from "lucide-react";

export default async function AdminLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const user = await getCurrentUser();

  // Enforce server-side authorization: only ADMIN or SUPERADMIN allowed
  if (!user || (user.role !== "ADMIN" && user.role !== "SUPERADMIN")) {
    redirect("/login?error=UnauthorizedAdminAccess");
  }

  const adminNav = [
    { href: "/admin", label: "Overview", icon: LayoutDashboard },
    { href: "/admin/users", label: "Registered Users", icon: Users },
    { href: "/admin/tickets", label: "Support Tickets", icon: LifeBuoy },
    { href: "/admin/chat", label: "Live Chat & Console", icon: MessageSquare },
    { href: "/admin/modes", label: "Game Modes", icon: Gamepad2 },
    { href: "/admin/announcements", label: "Announcements", icon: Bell },
    { href: "/admin/leaderboards", label: "Leaderboards", icon: Trophy },
    { href: "/admin/products", label: "Products & Ranks", icon: ShoppingBag },
    { href: "/admin/staff", label: "Staff Team", icon: Shield },
    { href: "/admin/orders", label: "Orders & Delivery", icon: ShoppingCart },
    { href: "/admin/applications", label: "Staff Applications", icon: UserCheck },
    { href: "/admin/audit", label: "Audit Logs", icon: FileText },
  ];

  return (
    <div className="min-h-screen bg-[#08090d] flex flex-col md:flex-row border-t border-slate-800 pt-20">
      {/* Admin Sidebar */}
      <aside className="w-full md:w-64 bg-slate-950/90 border-r border-slate-800/80 p-6 flex flex-col justify-between shrink-0">
        <div className="space-y-6">
          <div className="flex items-center gap-3">
            <div className="p-2 rounded-xl bg-amber-500/10 text-amber-400 border border-amber-500/20">
              <Shield className="w-5 h-5" />
            </div>
            <div>
              <h2 className="font-black text-sm text-white tracking-wider uppercase">
                Admin Panel
              </h2>
              <span className="text-[10px] text-amber-400 font-mono font-semibold">
                {user.role} ACCESS
              </span>
            </div>
          </div>

          <nav className="space-y-1">
            {adminNav.map((item) => {
              const Icon = item.icon;
              return (
                <NextLink
                  key={item.href}
                  href={item.href}
                  className="flex items-center gap-3 px-3.5 py-2.5 rounded-xl text-xs font-semibold text-slate-300 hover:text-white hover:bg-slate-900 border border-transparent hover:border-slate-800 transition-all"
                >
                  <Icon className="w-4 h-4 text-emerald-400" />
                  <span>{item.label}</span>
                </NextLink>
              );
            })}
          </nav>
        </div>

        <div className="pt-6 border-t border-slate-800/80 space-y-3">
          <NextLink
            href="/"
            className="flex items-center gap-2 text-xs text-slate-400 hover:text-emerald-400 transition-colors"
          >
            <ArrowLeft className="w-3.5 h-3.5" />
            <span>Back to Public Website</span>
          </NextLink>
          <div className="text-[10px] text-slate-400 font-mono truncate">
            Logged as: {user.email}
          </div>
        </div>
      </aside>

      {/* Main Admin Content Area */}
      <main className="flex-1 p-6 sm:p-10 overflow-x-hidden">{children}</main>
    </div>
  );
}
