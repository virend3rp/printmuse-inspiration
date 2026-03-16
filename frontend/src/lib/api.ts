const API_URL = process.env.NEXT_PUBLIC_API_URL;

async function refreshToken() {
  const res = await fetch(`${API_URL}/auth/refresh`, {
    method: "POST",
    credentials: "include",
  });

  if (!res.ok) {
    sessionStorage.removeItem("access_token");
    sessionStorage.removeItem("user");
    window.location.href = "/login";
    throw new Error("Session expired");
  }

  const data = await res.json();

  sessionStorage.setItem(
    "access_token",
    data.data.access_token
  );

  return data.data.access_token;
}

export async function apiFetch(
  path: string,
  options: RequestInit = {}
) {
  const token =
    typeof window !== "undefined"
      ? sessionStorage.getItem("access_token")
      : null;

  const makeRequest = async (authToken: string | null) =>
    fetch(`${API_URL}${path}`, {
      credentials: "include",
      headers: {
        "Content-Type": "application/json",
        ...(authToken
          ? { Authorization: `Bearer ${authToken}` }
          : {}),
        ...(options.headers || {}),
      },
      ...options,
    });

  let res = await makeRequest(token);

  // If unauthorized → try refresh once
  if (res.status === 401 && token) {
    try {
      const newToken = await refreshToken();
      res = await makeRequest(newToken);
    } catch {
      throw new Error("Unauthorized");
    }
  }

  if (!res.ok) {
    const error = await res.json().catch(() => ({}));
    throw new Error(error.error || "Request failed");
  }

  return res.json();
}