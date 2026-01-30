import { ReactNode } from "react";
import { Sidebar } from "./Sidebar";
import { motion } from "framer-motion";

interface DashboardLayoutProps {
  children: ReactNode;
}

export const DashboardLayout = ({ children }: DashboardLayoutProps) => {
  return (
    <div className="min-h-screen bg-background bg-grid-pattern bg-grid">
      {/* Background gradient overlays */}
      <div className="fixed inset-0 pointer-events-none">
        <div className="absolute top-0 left-1/4 w-48 lg:w-96 h-48 lg:h-96 bg-primary/5 rounded-full blur-3xl" />
        <div className="absolute bottom-0 right-1/4 w-48 lg:w-96 h-48 lg:h-96 bg-secondary/5 rounded-full blur-3xl" />
      </div>

      <Sidebar />

      <main className="lg:ml-64 min-h-screen relative">
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ duration: 0.3 }}
          className="p-3 sm:p-4 lg:p-6 pb-20 lg:pb-6"
        >
          {children}
        </motion.div>
      </main>
    </div>
  );
};
