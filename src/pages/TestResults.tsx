import { useEffect, useState } from "react";
import { useNavigate, useParams } from "react-router-dom";
import { Download, Plus, CheckCircle2, AlertTriangle, XCircle } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Header } from "@/components/Header";
import { supabase } from "@/integrations/supabase/client";
import { analyzeParticipantMetrics } from "@/lib/simulation";

interface ParticipantResult {
  id: string;
  name: string;
  role: string;
  profile_id: string;
  avgFps: number;
  totalFreezes: number;
  resolution: string;
  issues: string[];
  status: "pass" | "warn" | "fail";
}

export default function TestResults() {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const [test, setTest] = useState<any>(null);
  const [results, setResults] = useState<ParticipantResult[]>([]);
  const [profiles, setProfiles] = useState<Record<string, string>>({});

  useEffect(() => {
    if (!id) return;
    const load = async () => {
      const [{ data: t }, { data: parts }, { data: profs }] = await Promise.all([
        supabase.from("tests").select("*").eq("id", id).maybeSingle(),
        supabase.from("participants").select("*").eq("test_id", id),
        supabase.from("network_profiles").select("id, name"),
      ]);
      setTest(t);
      const profMap: Record<string, string> = {};
      profs?.forEach((p) => { profMap[p.id] = p.name; });
      setProfiles(profMap);

      if (parts) {
        const res: ParticipantResult[] = [];
        for (const p of parts) {
          const { data: metrics } = await supabase
            .from("metrics")
            .select("fps, width, height, freeze_count")
            .eq("participant_id", p.id);
          const analysis = analyzeParticipantMetrics(metrics ?? []);
          const lastMetric = metrics?.length ? metrics[metrics.length - 1] : null;
          res.push({
            id: p.id,
            name: p.name,
            role: p.role,
            profile_id: p.profile_id,
            avgFps: analysis.avgFps,
            totalFreezes: analysis.totalFreezes,
            resolution: lastMetric ? `${lastMetric.width}×${lastMetric.height}` : "N/A",
            issues: analysis.issues,
            status: analysis.status,
          });
        }
        setResults(res);
      }
    };
    load();
  }, [id]);

  const allIssues = [...new Set(results.flatMap((r) => r.issues))];

  const downloadReport = () => {
    const report = { test, results, generatedAt: new Date().toISOString() };
    const blob = new Blob([JSON.stringify(report, null, 2)], { type: "application/json" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = `netscope-report-${id}.json`;
    a.click();
    URL.revokeObjectURL(url);
  };

  const StatusIcon = ({ status }: { status: string }) => {
    if (status === "pass") return <CheckCircle2 className="h-4 w-4 text-success" />;
    if (status === "warn") return <AlertTriangle className="h-4 w-4 text-warning" />;
    return <XCircle className="h-4 w-4 text-destructive" />;
  };

  return (
    <div className="min-h-screen flex flex-col">
      <Header />
      <main className="flex-1 container py-8 max-w-4xl">
        <h1 className="text-2xl font-bold mb-6">Test Results</h1>

        <div className="grid grid-cols-3 gap-4 mb-6">
          <Card>
            <CardContent className="pt-4 text-center">
              <p className="text-2xl font-bold">{test?.duration_seconds ?? 0}s</p>
              <p className="text-xs text-muted-foreground">Duration</p>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="pt-4 text-center">
              <p className="text-2xl font-bold">{results.length}</p>
              <p className="text-xs text-muted-foreground">Participants</p>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="pt-4 text-center">
              <p className="text-2xl font-bold">{allIssues.length}</p>
              <p className="text-xs text-muted-foreground">Issues Detected</p>
            </CardContent>
          </Card>
        </div>

        <Card className="mb-6">
          <CardHeader><CardTitle className="text-base">Results</CardTitle></CardHeader>
          <CardContent>
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Participant</TableHead>
                  <TableHead>Network</TableHead>
                  <TableHead className="text-right">Avg FPS</TableHead>
                  <TableHead>Resolution</TableHead>
                  <TableHead className="text-right">Freezes</TableHead>
                  <TableHead>Status</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {results.map((r) => (
                  <TableRow key={r.id}>
                    <TableCell className="font-medium">{r.name}</TableCell>
                    <TableCell><Badge variant="outline" className="text-xs">{profiles[r.profile_id] ?? r.profile_id}</Badge></TableCell>
                    <TableCell className="text-right font-mono">{r.avgFps}</TableCell>
                    <TableCell className="font-mono text-xs">{r.resolution}</TableCell>
                    <TableCell className="text-right">{r.totalFreezes}</TableCell>
                    <TableCell><div className="flex items-center gap-1"><StatusIcon status={r.status} /><span className="capitalize text-xs">{r.status}</span></div></TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </CardContent>
        </Card>

        {allIssues.length > 0 && (
          <Card className="mb-6">
            <CardHeader><CardTitle className="text-base">Issues Detected</CardTitle></CardHeader>
            <CardContent>
              <ul className="space-y-1">
                {allIssues.map((issue) => (
                  <li key={issue} className="flex items-center gap-2 text-sm">
                    <AlertTriangle className="h-3 w-3 text-warning" /> {issue}
                  </li>
                ))}
              </ul>
            </CardContent>
          </Card>
        )}

        <div className="flex gap-3">
          <Button variant="outline" onClick={downloadReport} className="gap-2">
            <Download className="h-4 w-4" /> Download Report
          </Button>
          <Button onClick={() => navigate("/test/new")} className="gap-2">
            <Plus className="h-4 w-4" /> New Test
          </Button>
        </div>
      </main>
    </div>
  );
}
