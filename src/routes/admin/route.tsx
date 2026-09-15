import { createFileRoute, Outlet, useNavigate, useRouterState } from "@tanstack/react-router";
import { useEffect } from "react";
import { useAuth } from "@/hooks/useAuth";

export const Route = createFileRoute("/admin")({
  head: () => ({
    meta: [
      { title: "CMS — Nathanael Suhendar" },
      { name: "description", content: "Content management for the Nathanael Suhendar portfolio." },
      { name: "robots", content: "noindex, nofollow" },
    ],
  }),
  component: AdminGate,
});

function AdminGate() {
  const { session, loading } = useAuth();
  const navigate = useNavigate();
  const pathname = useRouterState({ select: (s) => s.location.pathname });
  const isLogin = pathname.startsWith("/admin/login");

  useEffect(() => {
    if (loading) return;
    if (!session && !isLogin) {
      navigate({ to: "/admin/login", replace: true });
    }
    if (session && isLogin) {
      navigate({ to: "/admin/dashboard", replace: true });
    }
  }, [session, loading, isLogin, navigate]);

  if (loading) {
    return (
      <div className="flex min-h-screen items-center justify-center">
        <p className="text-sm text-muted-foreground">Checking your session…</p>
      </div>
    );
  }

  if (!session && !isLogin) return null;

  return <Outlet />;
}
