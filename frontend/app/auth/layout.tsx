import { ReactNode } from "react";

export default function AuthLayout({ children }: { children: ReactNode }) {
  return (
    <div className="min-h-screen flex items-center justify-center bg-primary p-6">
      <div className="w-full max-w-md bg-surface/50 backdrop-blur-xl p-8 rounded-container border border-accent/20">
        {children}
      </div>
    </div>
  );
}
