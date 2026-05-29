import { readFile } from "node:fs/promises";
import { join } from "node:path";

const projectRef = process.env.NEXT_PUBLIC_SUPABASE_URL?.match(
  /^https:\/\/([a-z0-9]+)\.supabase\.co$/i
)?.[1];
const secretKey = process.env.SUPABASE_SECRET_KEY || process.env.SUPABASE_SERVICE_ROLE_KEY;
const accessToken = process.env.SUPABASE_ACCESS_TOKEN || secretKey;

if (!projectRef) {
  throw new Error("Missing NEXT_PUBLIC_SUPABASE_URL or project ref.");
}

if (!accessToken) {
  throw new Error(
    "Missing SUPABASE_ACCESS_TOKEN or fallback server key for bootstrap attempt."
  );
}

const schemaSql = await readFile(join(process.cwd(), "supabase", "schema.sql"), "utf8");
const seedSql = await readFile(join(process.cwd(), "supabase", "seed.sql"), "utf8");

const attempts = [
  {
    name: "management-api",
    enabled: Boolean(accessToken),
    url: `https://api.supabase.com/v1/projects/${projectRef}/database/query`,
    headers: {
      Authorization: `Bearer ${accessToken}`,
      "Content-Type": "application/json"
    }
  },
  {
    name: "project-pg-query",
    enabled: Boolean(secretKey),
    url: `https://${projectRef}.supabase.co/pg/query`,
    headers: {
      apikey: secretKey,
      Authorization: `Bearer ${secretKey}`,
      "Content-Type": "application/json"
    }
  },
  {
    name: "project-pg-meta-query",
    enabled: Boolean(secretKey),
    url: `https://${projectRef}.supabase.co/pg-meta/query`,
    headers: {
      apikey: secretKey,
      Authorization: `Bearer ${secretKey}`,
      "Content-Type": "application/json"
    }
  }
].filter((attempt) => attempt.enabled);

async function postSql(target, query) {
  const response = await fetch(target.url, {
    method: "POST",
    headers: target.headers,
    body: JSON.stringify({ query })
  });

  const text = await response.text();
  return {
    ok: response.ok,
    status: response.status,
    statusText: response.statusText,
    text
  };
}

for (const attempt of attempts) {
  try {
    const schemaResult = await postSql(attempt, schemaSql);
    if (!schemaResult.ok) {
      console.log(
        JSON.stringify({
          endpoint: attempt.name,
          phase: "schema",
          status: schemaResult.status,
          statusText: schemaResult.statusText,
          body: schemaResult.text.slice(0, 600)
        })
      );
      continue;
    }

    const seedResult = await postSql(attempt, seedSql);
    console.log(
      JSON.stringify({
        endpoint: attempt.name,
        schema: { status: schemaResult.status, ok: schemaResult.ok },
        seed: {
          status: seedResult.status,
          ok: seedResult.ok,
          body: seedResult.text.slice(0, 600)
        }
      })
    );

    if (!seedResult.ok) {
      process.exitCode = 1;
    }
    process.exit(0);
  } catch (error) {
    console.log(
      JSON.stringify({
        endpoint: attempt.name,
        phase: "request",
        error: error instanceof Error ? error.message : String(error)
      })
    );
  }
}

process.exitCode = 1;
