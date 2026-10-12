import type { SslMode } from "../api/types";

export const DESKTOP_DATABASE_PATH = "/api/v1/desktop/database";

export const SSL_MODE_LABELS: Record<SslMode, string> = {
	REQUIRE: "Criptografada (recomendado)",
	VERIFY_FULL: "Criptografada e com certificado validado",
	DISABLE: "Sem criptografia (só em rede local)",
};

export const DEFAULT_POSTGRES_PORT = 5432;
