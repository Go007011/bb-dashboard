const API_BASE = process.env.NEXT_PUBLIC_API_URL || "";

export async function getDashboardSummary() {
  const res = await fetch(`${API_BASE}/api/dashboard/summary`);
  return res.json();
}

export async function getDashboardDeals() {
  const res = await fetch(`${API_BASE}/api/dashboard/deals`);
  return res.json();
}

export async function getDashboardSpvs() {
  const res = await fetch(`${API_BASE}/api/dashboard/spvs`);
  return res.json();
}

export async function getDashboardCharts() {
  const res = await fetch(`${API_BASE}/api/dashboard/charts`);
  return res.json();
}
