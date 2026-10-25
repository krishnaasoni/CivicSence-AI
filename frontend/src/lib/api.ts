// Robust API Client for CivicSense AI with port auto-discovery (8000 / 8001)

const CANDIDATE_PORTS = [8000, 8001];

let activePort: number | null = null;

export async function getBaseApiUrl(): Promise<string> {
  if (activePort) {
    return `http://localhost:${activePort}`;
  }

  for (const port of CANDIDATE_PORTS) {
    try {
      const res = await fetch(`http://localhost:${port}/health`, { method: "GET" });
      if (res.ok) {
        activePort = port;
        return `http://localhost:${port}`;
      }
    } catch {
      // try next port
    }
  }

  return "http://localhost:8000";
}

export async function apiRequest(path: string, options: RequestInit = {}): Promise<Response> {
  const ports = activePort ? [activePort, ...CANDIDATE_PORTS.filter(p => p !== activePort)] : CANDIDATE_PORTS;

  for (const port of ports) {
    try {
      const res = await fetch(`http://localhost:${port}${path}`, options);
      if (res.ok || res.status < 500) {
        activePort = port;
        return res;
      }
    } catch {
      // Try next port
    }
  }

  throw new Error(`Failed to reach CivicSense AI backend on ports ${CANDIDATE_PORTS.join(", ")}`);
}
