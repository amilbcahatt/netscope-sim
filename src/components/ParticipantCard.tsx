import { Monitor, Zap } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { getStatusEmoji } from "@/lib/simulation";

interface ParticipantCardProps {
  name: string;
  role: string;
  profileId: string;
  profileName: string;
  vncPort: number;
  fps: number;
  width: number;
  height: number;
  isDropped: boolean;
  profiles: { id: string; name: string }[];
  onSignalDrop: () => void;
  onChangeNetwork: (profileId: string) => void;
}

export function ParticipantCard({
  name, role, profileId, profileName, vncPort, fps, width, height, isDropped, profiles, onSignalDrop, onChangeNetwork,
}: ParticipantCardProps) {
  return (
    <Card className="overflow-hidden">
      <div className="flex items-center justify-between border-b px-4 py-2">
        <div className="flex items-center gap-2">
          <span className="font-semibold text-sm">{name}</span>
          <Badge variant="secondary" className="text-xs capitalize">{role}</Badge>
        </div>
        <span className="text-lg">{getStatusEmoji(fps)}</span>
      </div>
      <div className="bg-foreground/5 flex items-center justify-center h-40">
        <div className="text-center text-muted-foreground">
          <Monitor className="h-10 w-10 mx-auto mb-1 opacity-40" />
          <div className="text-xs">VNC Stream</div>
          <div className="text-xs opacity-60">{name} · Port {vncPort}</div>
        </div>
      </div>
      <CardContent className="p-3 space-y-2">
        <div className="flex items-center justify-between text-xs">
          <Badge variant={isDropped ? "destructive" : "outline"} className="text-xs">{profileName}</Badge>
          <span className="font-mono">
            FPS: <strong>{fps.toFixed(0)}</strong> · {width}×{height}
          </span>
        </div>
        <div className="flex gap-2">
          <Button size="sm" variant="destructive" className="flex-1 text-xs h-7" onClick={onSignalDrop} disabled={isDropped}>
            <Zap className="h-3 w-3 mr-1" /> Signal Drop
          </Button>
          <Select value={profileId} onValueChange={onChangeNetwork}>
            <SelectTrigger className="flex-1 h-7 text-xs">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              {profiles.map((p) => (
                <SelectItem key={p.id} value={p.id} className="text-xs">{p.name}</SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>
      </CardContent>
    </Card>
  );
}
