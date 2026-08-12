import { describe, it, expect } from "vitest";
import { createClient } from "@/lib/supabase/browser";

describe("Supabase Client Factories", () => {
  it("should instantiate browser client without throwing errors", () => {
    const client = createClient();
    expect(client).toBeDefined();
    expect(typeof client.auth).toBe("object");
  });
});
