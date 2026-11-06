import { readFileSync } from "node:fs";
import { resolve } from "node:path";
import { describe, expect, it } from "vitest";

const root = resolve(__dirname, "../..");
const migration = readFileSync(resolve(root, "drizzle/migrations/0003_admin_set_user_plan.sql"), "utf-8");
const adminUsers = readFileSync(resolve(root, "src/pages/admin/AdminUsers.tsx"), "utf-8");

describe("admin plan changes", () => {
  it("allows only super admins to set Free or Pro through the database function", () => {
    expect(migration).toContain("private.has_role(auth.uid(), 'super_admin'::public.app_role)");
    expect(migration).toContain("p_plan NOT IN ('free', 'pro')");
    expect(migration).toContain("public.log_admin_audit(");
    expect(adminUsers).toContain('supabase.rpc("admin_set_user_plan"');
    expect(adminUsers).not.toMatch(/\.from\("profiles"\)\s*\.update\(updates\)/);
  });

  it("does not turn a manual Pro grant into paid subscription revenue", () => {
    expect(migration).toContain("subscription_type = 'none'");
    expect(migration).toContain("payment_status = 'unpaid'");
  });
});