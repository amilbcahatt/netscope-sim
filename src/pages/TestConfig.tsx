import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { Plus, Trash2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Header } from "@/components/Header";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";

interface Profile { id: string; name: string }
interface Participant { role: string; name: string; profileId: string }

export default function TestConfig() {
  const navigate = useNavigate();
  const [profiles, setProfiles] = useState<Profile[]>([]);
  const [meetingUrl, setMeetingUrl] = useState("https://meet.jit.si/netscope-test");
  const [duration, setDuration] = useState(60);
  const [participants, setParticipants] = useState<Participant[]>([
    { role: "teacher", name: "Teacher", profileId: "none" },
    { role: "student", name: "Student 1", profileId: "jio-4g-poor" },
  ]);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    supabase.from("network_profiles").select("id, name").then(({ data }) => {
      if (data) setProfiles(data);
    });
  }, []);

  const addParticipant = () => {
    setParticipants((p) => [...p, { role: "student", name: `Student ${p.length}`, profileId: "none" }]);
  };

  const removeParticipant = (i: number) => {
    setParticipants((p) => p.filter((_, idx) => idx !== i));
  };

  const update = (i: number, field: keyof Participant, value: string) => {
    setParticipants((p) => p.map((pp, idx) => (idx === i ? { ...pp, [field]: value } : pp)));
  };

  const startTest = async () => {
    if (!meetingUrl || participants.length === 0) {
      toast.error("Add a meeting URL and at least one participant");
      return;
    }
    setLoading(true);
    const { data: test, error } = await supabase
      .from("tests")
      .insert({ meeting_url: meetingUrl, duration_seconds: duration, status: "running", started_at: new Date().toISOString() })
      .select()
      .single();
    if (error || !test) { toast.error("Failed to create test"); setLoading(false); return; }

    const rows = participants.map((p, i) => ({
      test_id: test.id,
      role: p.role,
      name: p.name,
      profile_id: p.profileId,
      vnc_port: 6081 + i,
      status: "running",
    }));
    await supabase.from("participants").insert(rows);
    navigate(`/test/${test.id}/running`);
  };

  return (
    <div className="min-h-screen flex flex-col">
      <Header />
      <main className="flex-1 container py-8 max-w-2xl">
        <h1 className="text-2xl font-bold mb-6">Configure Test</h1>

        <Card className="mb-6">
          <CardHeader><CardTitle className="text-base">Meeting Details</CardTitle></CardHeader>
          <CardContent className="space-y-4">
            <div>
              <Label>Meeting URL</Label>
              <Input value={meetingUrl} onChange={(e) => setMeetingUrl(e.target.value)} placeholder="https://meet.jit.si/room" />
            </div>
            <div>
              <Label>Duration (seconds)</Label>
              <Input type="number" value={duration} onChange={(e) => setDuration(Number(e.target.value))} min={10} max={600} />
            </div>
          </CardContent>
        </Card>

        <div className="flex items-center justify-between mb-4">
          <h2 className="text-lg font-semibold">Participants ({participants.length})</h2>
          <Button size="sm" variant="outline" onClick={addParticipant}><Plus className="h-3 w-3 mr-1" /> Add</Button>
        </div>

        <div className="space-y-3 mb-6">
          {participants.map((p, i) => (
            <Card key={i}>
              <CardContent className="flex items-end gap-3 py-3 px-4">
                <div className="flex-1 space-y-1">
                  <Label className="text-xs">Name</Label>
                  <Input value={p.name} onChange={(e) => update(i, "name", e.target.value)} className="h-8 text-sm" />
                </div>
                <div className="w-28 space-y-1">
                  <Label className="text-xs">Role</Label>
                  <Select value={p.role} onValueChange={(v) => update(i, "role", v)}>
                    <SelectTrigger className="h-8 text-xs"><SelectValue /></SelectTrigger>
                    <SelectContent>
                      <SelectItem value="teacher">Teacher</SelectItem>
                      <SelectItem value="student">Student</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                <div className="w-40 space-y-1">
                  <Label className="text-xs">Network</Label>
                  <Select value={p.profileId} onValueChange={(v) => update(i, "profileId", v)}>
                    <SelectTrigger className="h-8 text-xs"><SelectValue /></SelectTrigger>
                    <SelectContent>
                      {profiles.map((pr) => (
                        <SelectItem key={pr.id} value={pr.id} className="text-xs">{pr.name}</SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
                <Button size="icon" variant="ghost" className="h-8 w-8 shrink-0" onClick={() => removeParticipant(i)}>
                  <Trash2 className="h-3 w-3 text-destructive" />
                </Button>
              </CardContent>
            </Card>
          ))}
        </div>

        <Button className="w-full" size="lg" onClick={startTest} disabled={loading}>
          {loading ? "Starting…" : "Start Test"}
        </Button>
      </main>
    </div>
  );
}
