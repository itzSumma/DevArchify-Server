const requiredOrigins = [
  "http://localhost:3000",
  "https://devarchify.vercel.app",
];

interface CorsEnvironment {
  CORS_ORIGIN?: string;
  CLIENT_URL?: string;
}

export function resolveCorsOrigins(
  env: CorsEnvironment = process.env,
): string[] {
  const configuredOrigins = [
    ...(env.CORS_ORIGIN?.split(",") ?? []),
    env.CLIENT_URL ?? "",
  ];

  return [
    ...new Set(
      [...requiredOrigins, ...configuredOrigins]
        .map((origin) => origin.trim())
        .filter(Boolean),
    ),
  ];
}
