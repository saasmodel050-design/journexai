import { useEffect, useState } from "react";
import { supabase } from "@/integrations/supabase/client";

type ContentMap = Record<string, Record<string, any>>; // page -> section_key -> values

let cache: ContentMap | null = null;
const listeners = new Set<(c: ContentMap) => void>();
let channel: any = null;

async function loadAll() {
  const { data } = await (supabase as any).from("site_content").select("page,section_key,published");
  const map: ContentMap = {};
  (data ?? []).forEach((r: any) => {
    map[r.page] = map[r.page] || {};
    map[r.page][r.section_key] = r.published || {};
  });
  cache = map;
  listeners.forEach((l) => l(map));
}

function ensureChannel() {
  if (channel) return;
  loadAll();
  channel = supabase
    .channel("site_content_live")
    .on("postgres_changes", { event: "*", schema: "public", table: "site_content" }, () => loadAll())
    .subscribe();
}

export function useSiteContent(page: string, sectionKey: string, fallback: Record<string, any> = {}) {
  const [content, setContent] = useState<Record<string, any>>(() => cache?.[page]?.[sectionKey] ?? fallback);

  useEffect(() => {
    ensureChannel();
    const update = (c: ContentMap) => setContent({ ...fallback, ...(c?.[page]?.[sectionKey] ?? {}) });
    listeners.add(update);
    if (cache) update(cache);
    return () => { listeners.delete(update); };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [page, sectionKey]);

  return content;
}

// Live plans
export function useLivePlans() {
  const [plans, setPlans] = useState<any[]>([]);
  useEffect(() => {
    const load = async () => {
      const { data } = await (supabase as any).from("plans").select("*").eq("active", true).order("sort_order");
      setPlans(data ?? []);
    };
    load();
    const ch = supabase
      .channel("plans_live")
      .on("postgres_changes", { event: "*", schema: "public", table: "plans" }, () => load())
      .subscribe();
    return () => { supabase.removeChannel(ch); };
  }, []);
  return plans;
}
