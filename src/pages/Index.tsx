import { useEffect, useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { Plus, FlaskConical, Clock, Users } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Header } from "@/components/Header";
import { supabase } from "@/integrations/supabase/client";

interface TestRow {
  id: string;
  meeting_url: string;
  duration_seconds: number;
  status: string;
  created_at: string;
}

export default function Home() {
  const navigate = useNavigate();
  const [tests, setTests] = useState<TestRow[]>([]);

  useEffect(() => {
    supabase.from("tests").select("*").order("created_at", { ascending: false }).limit(20).then(({ data }) => {
      if (data) setTests(data);
    });
  }, []);

  const statusVariant = (s: string) => {
    if (s === "completed") return "secondary";
    if (s === "running") return "default";
    return "outline";
  };

  return (
    <div className="min-h-screen flex flex-col">
      <Header />
      <main className="flex-1 container py-12">
        <div className="max-w-2xl mx-auto text-center mb-10">
          <h1 className="text-4xl font-bold tracking-tight mb-3">WebRTC Network Simulator</h1>
          <p className="text-muted-foreground text-lg mb-6">
            Test video call quality under real-world network conditions — Jio 4G, 3G, poor WiFi and more.
          </p>
          <Button size="lg" onClick={() => navigate("/test/new")} className="gap-2">
            <Plus className="h-4 w-4" /> Start New Test
          </Button>
        </div>

        {tests.length > 0 && (
          <section className="max-w-3xl mx-auto">
            <h2 className="text-lg font-semibold mb-4 flex items-center gap-2">
              <FlaskConical className="h-4 w-4" /> Recent Tests
            </h2>
            <div className="space-y-2">
              {tests.map((t) => (
                <Link key={t.id} to={t.status === "running" ? `/test/${t.id}/running` : `/test/${t.id}/results`}>
                  <Card className="hover:shadow-md transition-shadow cursor-pointer">
                    <CardContent className="flex items-center justify-between py-3 px-5">
                      <div className="flex items-center gap-4">
                        <Badge variant={statusVariant(t.status)} className="capitalize">{t.status}</Badge>
                        <span className="text-sm font-medium truncate max-w-[260px]">{t.meeting_url}</span>
                      </div>
                      <div className="flex items-center gap-4 text-xs text-muted-foreground">
                        <span className="flex items-center gap-1"><Clock className="h-3 w-3" />{t.duration_seconds}s</span>
                        <span>{new Date(t.created_at).toLocaleDateString()}</span>
                      </div>
                    </CardContent>
                  </Card>
                </Link>
              ))}
            </div>
          </section>
        )}
      </main>
    </div>
  );
}
