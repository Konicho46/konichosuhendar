import { createFileRoute, Link } from "@tanstack/react-router";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { ArrowDown, ArrowUp, Star, Trash2 } from "lucide-react";
import { toast } from "sonner";
import { AdminShell, btnPrimary } from "@/components/admin/AdminShell";
import { allProjectsQuery, type Project } from "@/lib/portfolio";
import { supabase } from "@/integrations/supabase/client";

export const Route = createFileRoute("/admin/projects/")({
  component: ProjectsAdmin;
});

function ProjectsAdmin() {
  return null;
}
