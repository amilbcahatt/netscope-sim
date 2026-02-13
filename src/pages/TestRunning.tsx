import { useCallback, useEffect, useRef, useState } from "react";
import { useNavigate, useParams } from "react-router-dom";
import { Square } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Progress } from "@/components/ui/progress";
import { Header } from "@/components/Header";
import { ParticipantCard } from "@/components/ParticipantCard";
import { supabase } from "@/integrations/supabase/client";
import { generateMetrics } from "@/lib/simulation";
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer } from "recharts";

interface ParticipantRow {
  id: string;
  name: string;
  role: string;
  profile_id: string;
  vnc_port: number | null;
}

interface ProfileRow { id: string; name: string }

interface LiveMetrics {
  fps: number;
  width: number;
  height: number;
  isDropped: boolean;
  profileId: string;
}

const COLORS = ["#3B82F6", "#10B981", "#F59E0B", "#EF4444", "#8B5CF6", "#EC4899"];

export default function TestRunning() {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const [participants, setParticipants] = useState<ParticipantRow[]>([]);
  const [profiles, setProfiles] = useState<ProfileRow[]>([]);
  const [duration, setDuration] = useState(60);
  const [elapsed, setElapsed] = useState(0);
  const [liveMetrics, setLiveMetrics] = useState<Record<string, LiveMetrics>>({});
  const [chartData, setChartData] = useState<Record<string, number>[]>([]);
  const intervalRef = useRef<ReturnType<typeof setInterval> | null>(null);
  const dropTimers = useRef<Record<string, ReturnType<typeof setTimeout>>>({});

  // Load test data
  useEffect(() => {
    if (!id) return;
    const load = async () => {
      const [{ data: test }, { data: parts }, { data: profs }] = await Promise.all([
        supabase.from("tests").select("*").eq("id", id).maybeSingle(),
        supabase.from("participants").select("*").eq("test_id", id),
        supabase.from("network_profiles").select("id, name"),
      ]);
      if (test) setDuration(test.duration_seconds);
      if (parts) {
        setParticipants(parts);
        const initial: Record<string, LiveMetrics> = {};
        parts.forEach((p) => {
          initial[p.id] = { fps: 0, width: 0, height: 0, isDropped: false, profileId: p.profile_id };
        });
        setLiveMetrics(initial);
      }
      if (profs) setProfiles(profs);
    };
    load();
  }, [id]);

  // Simulation loop
  const tick = useCallback(() => {
    setElapsed((prev) => prev + 1);
    setLiveMetrics((prev) => {
      const next = { ...prev };
      const chartPoint: Record<string, number> = {};
      for (const [pid, lm] of Object.entries(next)) {
        const m = generateMetrics(lm.profileId, lm.isDropped);
        next[pid] = { ...lm, fps: m.fps, width: m.width, height: m.height };
        chartPoint[pid] = m.fps;

        // Save to DB (fire and forget)
        if (id) {
          supabase.from("metrics").insert({
            test_id: id,
            participant_id: pid,
            fps: m.fps,
            width: m.width,
            height: m.height,
            packets_lost: m.packets_lost,
            freeze_count: m.freeze_count,
            jitter: m.jitter,
          }).then(() => {});
        }
      }
      setChartData((cd) => [...cd.slice(-59), { time: cd.length, ...chartPoint }]);
      return next;
    });
  }, [id]);

  useEffect(() => {
    if (participants.length === 0) return;
    intervalRef.current = setInterval(tick, 1000);
    return () => { if (intervalRef.current) clearInterval(intervalRef.current); };
  }, [participants, tick]);

  // Auto-complete
  useEffect(() => {
    if (elapsed >= duration && duration > 0) {
      if (intervalRef.current) clearInterval(intervalRef.current);
      supabase.from("tests").update({ status: "completed", completed_at: new Date().toISOString() }).eq("id", id!).then(() => {
        navigate(`/test/${id}/results`);
      });
    }
  }, [elapsed, duration, id, navigate]);

  const stopTest = async () => {
    if (intervalRef.current) clearInterval(intervalRef.current);
    await supabase.from("tests").update({ status: "completed", completed_at: new Date().toISOString() }).eq("id", id!);
    navigate(`/test/${id}/results`);
  };

  const handleSignalDrop = (pid: string) => {
    setLiveMetrics((prev) => ({ ...prev, [pid]: { ...prev[pid], isDropped: true } }));
    dropTimers.current[pid] = setTimeout(() => {
      setLiveMetrics((prev) => ({ ...prev, [pid]: { ...prev[pid], isDropped: false } }));
    }, 5000);
  };

  const handleChangeNetwork = (pid: string, profileId: string) => {
    setLiveMetrics((prev) => ({ ...prev, [pid]: { ...prev[pid], profileId } }));
    supabase.from("participants").update({ profile_id: profileId }).eq("id", pid).then(() => {});
  };

  const profileName = (pid: string) => {
    const profileId = liveMetrics[pid]?.profileId;
    return profiles.find((p) => p.id === profileId)?.name ?? profileId;
  };

  const progress = duration > 0 ? Math.min((elapsed / duration) * 100, 100) : 0;

  return (
    <div className="min-h-screen flex flex-col">
      <Header />
      <main className="flex-1 container py-6">
        <div className="flex items-center justify-between mb-4">
          <div>
            <h1 className="text-xl font-bold">Test Running</h1>
            <p className="text-sm text-muted-foreground">{elapsed}s / {duration}s elapsed</p>
          </div>
          <Button variant="destructive" size="sm" onClick={stopTest}>
            <Square className="h-3 w-3 mr-1" /> Stop Test
          </Button>
        </div>
        <Progress value={progress} className="mb-6 h-2" />

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-8">
          {participants.map((p) => (
            <ParticipantCard
              key={p.id}
              name={p.name}
              role={p.role}
              profileId={liveMetrics[p.id]?.profileId ?? p.profile_id}
              profileName={profileName(p.id)}
              vncPort={p.vnc_port ?? 6081}
              fps={liveMetrics[p.id]?.fps ?? 0}
              width={liveMetrics[p.id]?.width ?? 0}
              height={liveMetrics[p.id]?.height ?? 0}
              isDropped={liveMetrics[p.id]?.isDropped ?? false}
              profiles={profiles}
              onSignalDrop={() => handleSignalDrop(p.id)}
              onChangeNetwork={(pid) => handleChangeNetwork(p.id, pid)}
            />
          ))}
        </div>

        {chartData.length > 1 && (
          <div className="rounded-lg border bg-card p-4">
            <h2 className="text-sm font-semibold mb-3">Live FPS</h2>
            <ResponsiveContainer width="100%" height={220}>
              <LineChart data={chartData}>
                <CartesianGrid strokeDasharray="3 3" className="opacity-30" />
                <XAxis dataKey="time" tick={{ fontSize: 10 }} />
                <YAxis domain={[0, 35]} tick={{ fontSize: 10 }} />
                <Tooltip />
                <Legend />
                {participants.map((p, i) => (
                  <Line key={p.id} type="monotone" dataKey={p.id} name={p.name} stroke={COLORS[i % COLORS.length]} dot={false} strokeWidth={2} />
                ))}
              </LineChart>
            </ResponsiveContainer>
          </div>
        )}
      </main>
    </div>
  );
}
