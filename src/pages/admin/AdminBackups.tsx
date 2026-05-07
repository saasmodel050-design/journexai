import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Archive } from "lucide-react";

export default function AdminBackups() {
  return (
    <div className="space-y-4">
      <h1 className="text-2xl font-bold">Backups & Restore</h1>
      <Card className="bg-card/40 backdrop-blur border-border/50">
        <CardHeader><CardTitle className="text-base flex items-center gap-2"><Archive className="h-4 w-4" /> Managed Backups</CardTitle></CardHeader>
        <CardContent className="text-sm text-muted-foreground space-y-2">
          <p>Lovable Cloud automatically takes daily backups of your database.</p>
          <p>Manual backup creation and restore from this UI requires connecting a privileged backend job. This is intentionally not enabled by default to prevent accidental data loss.</p>
        </CardContent>
      </Card>
    </div>
  );
}
