import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { Users, Eye, CreditCard, TrendingUp } from "lucide-react";
import {
  LineChart, Line, BarChart, Bar, XAxis, YAxis, CartesianGrid,
  Tooltip, ResponsiveContainer, Cell,
} from "recharts";
import { subDays, format, startOfDay, eachDayOfInterval } from "date-fns";
import { es } from "date-fns/locale";

const PAGE_LABELS: Record<string, string> = {
  "/": "Inicio",
  "/sobre-mi": "Sobre mí",
  "/sesiones": "Sesiones",
  "/formacion": "Formación",
  "/formacion/cursos": "Cursos",
  "/contacto": "Contacto",
  "/formacion/calendario": "Calendario",
  "/auth": "Login",
  "/cuenta": "Mi cuenta",
};

const CHART_COLOR = "#7c6d9f";

const AdminAnalytics = () => {
  const now = new Date();
  const thirtyDaysAgo = subDays(now, 29).toISOString();

  const { data: pageViews = [] } = useQuery({
    queryKey: ["analytics-page-views"],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("page_views")
        .select("path, visited_at, session_id")
        .gte("visited_at", thirtyDaysAgo)
        .order("visited_at", { ascending: true });
      if (error) throw error;
      return data;
    },
  });

  const { data: totalUsers = 0 } = useQuery({
    queryKey: ["analytics-users"],
    queryFn: async () => {
      const { count, error } = await supabase
        .from("profiles")
        .select("id", { count: "exact", head: true });
      if (error) throw error;
      return count ?? 0;
    },
  });

  const { data: pendingRequests = 0 } = useQuery({
    queryKey: ["analytics-pending"],
    queryFn: async () => {
      const { count, error } = await supabase
        .from("payment_requests")
        .select("id", { count: "exact", head: true })
        .eq("status", "pending");
      if (error) throw error;
      return count ?? 0;
    },
  });

  // Visits per day (last 30 days)
  const days = eachDayOfInterval({ start: subDays(now, 29), end: now });
  const visitsByDay = days.map((day) => {
    const label = format(day, "d MMM", { locale: es });
    const start = startOfDay(day).toISOString();
    const end = startOfDay(subDays(day, -1)).toISOString();
    const count = pageViews.filter(
      (v) => v.visited_at >= start && v.visited_at < end
    ).length;
    return { label, count };
  });

  // Top pages
  const pageCounts = pageViews.reduce<Record<string, number>>((acc, v) => {
    const key = v.path.split("?")[0];
    acc[key] = (acc[key] ?? 0) + 1;
    return acc;
  }, {});
  const topPages = Object.entries(pageCounts)
    .sort((a, b) => b[1] - a[1])
    .slice(0, 8)
    .map(([path, count]) => ({ path: PAGE_LABELS[path] ?? path, count }));

  const totalVisits = pageViews.length;
  const uniqueSessions = new Set(pageViews.map((v) => v.session_id)).size;

  const kpis = [
    { label: "Visitas este mes", value: totalVisits, icon: Eye, color: "bg-lavender/20 text-lavender-deep" },
    { label: "Sesiones únicas", value: uniqueSessions, icon: TrendingUp, color: "bg-sage/20 text-sage-dark" },
    { label: "Usuarias registradas", value: totalUsers, icon: Users, color: "bg-earth/20 text-earth-deep" },
    { label: "Pagos pendientes", value: pendingRequests, icon: CreditCard, color: "bg-amber-100 text-amber-700" },
  ];

  return (
    <div className="space-y-8">
      {/* KPI cards */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        {kpis.map(({ label, value, icon: Icon, color }) => (
          <div key={label} className="rounded-2xl border border-border/50 bg-background/80 p-5">
            <div className={`w-10 h-10 rounded-xl flex items-center justify-center mb-3 ${color}`}>
              <Icon className="w-5 h-5" />
            </div>
            <p className="text-2xl font-heading font-light">{value}</p>
            <p className="text-xs text-muted-foreground font-body mt-0.5">{label}</p>
          </div>
        ))}
      </div>

      {/* Visits over time */}
      <div className="rounded-2xl border border-border/50 bg-background/80 p-6">
        <h3 className="font-body text-sm font-medium mb-5">Visitas últimos 30 días</h3>
        {totalVisits === 0 ? (
          <p className="text-sm text-muted-foreground font-body text-center py-8">
            Aún no hay datos de visitas. Se empezarán a registrar cuando subas la web al servidor.
          </p>
        ) : (
          <ResponsiveContainer width="100%" height={200}>
            <LineChart data={visitsByDay} margin={{ top: 0, right: 8, left: -20, bottom: 0 }}>
              <CartesianGrid strokeDasharray="3 3" stroke="hsl(var(--border))" />
              <XAxis
                dataKey="label"
                tick={{ fontSize: 11, fontFamily: "inherit" }}
                interval={4}
                tickLine={false}
                axisLine={false}
              />
              <YAxis tick={{ fontSize: 11, fontFamily: "inherit" }} tickLine={false} axisLine={false} allowDecimals={false} />
              <Tooltip
                contentStyle={{ borderRadius: 12, fontSize: 12, fontFamily: "inherit", border: "1px solid hsl(var(--border))" }}
                labelStyle={{ fontWeight: 500 }}
              />
              <Line
                type="monotone"
                dataKey="count"
                name="Visitas"
                stroke={CHART_COLOR}
                strokeWidth={2}
                dot={false}
                activeDot={{ r: 4 }}
              />
            </LineChart>
          </ResponsiveContainer>
        )}
      </div>

      {/* Top pages */}
      {topPages.length > 0 && (
        <div className="rounded-2xl border border-border/50 bg-background/80 p-6">
          <h3 className="font-body text-sm font-medium mb-5">Páginas más visitadas</h3>
          <ResponsiveContainer width="100%" height={220}>
            <BarChart data={topPages} layout="vertical" margin={{ top: 0, right: 8, left: 0, bottom: 0 }}>
              <CartesianGrid strokeDasharray="3 3" horizontal={false} stroke="hsl(var(--border))" />
              <XAxis type="number" tick={{ fontSize: 11, fontFamily: "inherit" }} tickLine={false} axisLine={false} allowDecimals={false} />
              <YAxis type="category" dataKey="path" tick={{ fontSize: 11, fontFamily: "inherit" }} tickLine={false} axisLine={false} width={90} />
              <Tooltip
                contentStyle={{ borderRadius: 12, fontSize: 12, fontFamily: "inherit", border: "1px solid hsl(var(--border))" }}
              />
              <Bar dataKey="count" name="Visitas" radius={[0, 6, 6, 0]}>
                {topPages.map((_, i) => (
                  <Cell key={i} fill={CHART_COLOR} opacity={1 - i * 0.08} />
                ))}
              </Bar>
            </BarChart>
          </ResponsiveContainer>
        </div>
      )}
    </div>
  );
};

export default AdminAnalytics;
