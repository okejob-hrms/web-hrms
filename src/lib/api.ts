import ky from "ky";

export const apiPublic = ky.create({
  prefixUrl:
    process.env.NEXT_PUBLIC_BASE_URL || "https://api.okejobhub.fun/api/v1",
  timeout: 10000,
  retry: { limit: 0 },
  headers: {
    Accept: "application/json",
    "Content-Type": "application/json",
  },
});

export const api = ky.create({
  prefixUrl:
    process.env.NEXT_PUBLIC_BASE_URL || "https://api.okejobhub.fun/api/v1",
  timeout: 10000,
  retry: { limit: 0 },
  hooks: {
    beforeRequest: [
      (request) => {
        const token =
          typeof window !== "undefined" ? localStorage.getItem("token") : null;
        if (token) {
          request.headers.set("Authorization", `Bearer ${token}`);
        }
        request.headers.set("Accept", "application/json");
        request.headers.set("Content-Type", "application/json");
      },
    ],
    afterResponse: [
      (_request, _options, response) => {
        if (response.status === 401 && typeof window !== "undefined") {
          localStorage.removeItem("token");
          window.location.href = "/auth/login";
        }
        return response;
      },
    ],
  },
});

export const apiUpload = ky.create({
  prefixUrl:
    process.env.NEXT_PUBLIC_BASE_URL || "https://api.okejobhub.fun/api/v1",
  timeout: 30000,
  retry: { limit: 0 },
  hooks: {
    beforeRequest: [
      (request) => {
        const token =
          typeof window !== "undefined" ? localStorage.getItem("token") : null;
        if (token) {
          request.headers.set("Authorization", `Bearer ${token}`);
        }
        request.headers.set("Accept", "application/json");
      },
    ],
  },
});
