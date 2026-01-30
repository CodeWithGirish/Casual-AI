import { NavLink, useLocation } from "react-router-dom";
import { motion } from "framer-motion";
import { useState } from "react";
import {
  Map,
  FlaskConical,
  Shield,
  Lock,
  Settings,
  GitCompare,
  FileText,
  Activity,
  Menu,
  X,
} from "lucide-react";

const navItems = [
  { path: "/", label: "Command Center", icon: Map, color: "saffron" },
  { path: "/simulator", label: "Policy Simulator", icon: FlaskConical, color: "cyan" },
  { path: "/resilience", label: "Resilience Scorecard", icon: Shield, color: "saffron" },
  { path: "/integrity", label: "Integrity Hub", icon: Lock, color: "cyan" },
  { path: "/configure", label: "Regional Config", icon: Settings, color: "saffron" },
  { path: "/counterfactual", label: "Counterfactual", icon: GitCompare, color: "cyan" },
  { path: "/report", label: "Policy Report", icon: FileText, color: "saffron" },
];

export const Sidebar = () => {
  const location = useLocation();
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);

  const SidebarContent = () => (
    <>
      {/* Logo */}
      <div className="p-4 lg:p-6 border-b border-border/50">
        <div className="flex items-center gap-3">
          <div className="w-8 h-8 lg:w-10 lg:h-10 rounded-lg bg-gradient-saffron flex items-center justify-center glow-saffron">
            <Activity className="w-4 h-4 lg:w-5 lg:h-5 text-primary-foreground" />
          </div>
          <div>
            <h1 className="font-bold text-base lg:text-lg text-foreground">CMIP</h1>
            <p className="text-[10px] lg:text-xs text-muted-foreground">Climate Migration AI</p>
          </div>
        </div>
      </div>

      {/* Navigation */}
      <nav className="flex-1 p-2 lg:p-4 space-y-1 overflow-y-auto scrollbar-hide">
        {navItems.map((item, index) => {
          const isActive = location.pathname === item.path;
          const Icon = item.icon;

          return (
            <NavLink
              key={item.path}
              to={item.path}
              className="block"
              onClick={() => setIsMobileMenuOpen(false)}
            >
              <motion.div
                initial={{ opacity: 0, x: -20 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: index * 0.05 }}
                className={`
                  flex items-center gap-2 lg:gap-3 px-3 lg:px-4 py-2.5 lg:py-3 rounded-lg transition-all duration-200
                  ${isActive
                    ? item.color === "saffron"
                      ? "bg-primary/10 text-primary border border-primary/30 glow-saffron"
                      : "bg-secondary/10 text-secondary border border-secondary/30 glow-cyan"
                    : "text-muted-foreground hover:text-foreground hover:bg-muted/50"
                  }
                `}
              >
                <Icon className={`w-4 h-4 lg:w-5 lg:h-5 ${isActive ? "pulse-glow" : ""}`} />
                <span className="text-xs lg:text-sm font-medium">{item.label}</span>
                {isActive && (
                  <motion.div
                    layoutId="activeIndicator"
                    className={`ml-auto w-1.5 h-1.5 lg:w-2 lg:h-2 rounded-full ${item.color === "saffron" ? "bg-primary" : "bg-secondary"
                      }`}
                  />
                )}
              </motion.div>
            </NavLink>
          );
        })}
      </nav>

      {/* Status Footer */}
      <div className="p-3 lg:p-4 border-t border-border/50">
        <div className="glass-card p-2 lg:p-3 rounded-lg">
          <div className="flex items-center gap-2 mb-1 lg:mb-2">
            <div className="w-2 h-2 rounded-full bg-success animate-pulse" />
            <span className="text-[10px] lg:text-xs text-muted-foreground">System Online</span>
          </div>
          <div className="text-[10px] lg:text-xs font-mono text-muted-foreground">
            Last sync: <span className="text-foreground">2 min ago</span>
          </div>
        </div>
      </div>
    </>
  );

  return (
    <>
      {/* Mobile Menu Button */}
      <button
        onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
        className="lg:hidden fixed top-4 left-4 z-[60] p-2 rounded-lg bg-sidebar border border-border/50"
      >
        {isMobileMenuOpen ? (
          <X className="w-5 h-5 text-foreground" />
        ) : (
          <Menu className="w-5 h-5 text-foreground" />
        )}
      </button>

      {/* Mobile Overlay */}
      {isMobileMenuOpen && (
        <div
          className="lg:hidden fixed inset-0 bg-background/80 backdrop-blur-sm z-40"
          onClick={() => setIsMobileMenuOpen(false)}
        />
      )}

      {/* Mobile Sidebar */}
      <motion.aside
        initial={{ x: -280 }}
        animate={{ x: isMobileMenuOpen ? 0 : -280 }}
        transition={{ type: "spring", damping: 25, stiffness: 200 }}
        className="lg:hidden fixed left-0 top-0 h-screen w-72 bg-sidebar border-r border-border/50 flex flex-col z-50 shadow-2xl"
      >
        <div className="flex justify-end p-4">
          <button onClick={() => setIsMobileMenuOpen(false)} className="p-2 rounded-full bg-muted/50">
            <X className="w-5 h-5" />
          </button>
        </div>
        <SidebarContent />
      </motion.aside>

      {/* Desktop Sidebar */}
      <motion.aside
        initial={{ x: -100, opacity: 0 }}
        animate={{ x: 0, opacity: 1 }}
        transition={{ duration: 0.5 }}
        className="hidden lg:flex fixed left-0 top-0 h-screen w-64 bg-sidebar border-r border-border/50 flex-col z-50"
      >
        <SidebarContent />
      </motion.aside>
    </>
  );
};
