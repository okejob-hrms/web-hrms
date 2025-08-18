import ky from "ky";
const token = "0";

export const api: typeof ky = ky.create({
  prefixUrl: process.env.NEXT_PUBLIC_BASE_URL,
  hooks: {
    beforeRequest: [
      (request) => {
        request.headers.set("Accecpt", "application/json");
        request.headers.set("Content-Type", "application/json");
        request.headers.set("Authorization", "Bearer " + token);
      },
    ],
  },
});
