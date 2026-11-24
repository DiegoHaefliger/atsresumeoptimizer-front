import type { AiProvider } from "../api/types";

export type CostTone = "success" | "warning";

export type KeyGuide = {
	keyUrl: string;
	keyUrlLabel: string;
	cost: string;
	costTone: CostTone;
	keyPrefix?: string;
	steps: string[];
	command?: { afterStep: number; text: string };
	note?: string;
};

export type CompatiblePreset = KeyGuide & {
	id: string;
	label: string;
	baseUrl: string;
};

export const BEGINNER_PROVIDER: AiProvider = "GEMINI";

export const PROVIDER_GUIDES: Partial<Record<AiProvider, KeyGuide>> = {
	GEMINI: {
		keyUrl: "https://aistudio.google.com/apikey",
		keyUrlLabel: "Abrir o Google AI Studio",
		cost: "Grátis, sem cartão",
		costTone: "success",
		keyPrefix: "AIza",
		steps: [
			"Clique no botão acima e entre com a sua conta Google (a mesma do Gmail serve).",
			"Aceite os termos, se aparecerem, e clique em \"Criar chave de API\" (Create API key).",
			"Se pedir um projeto, escolha o que aparecer na lista ou deixe o Google criar um.",
			"Clique em \"Copiar\" ao lado da chave criada e cole no campo abaixo.",
		],
		note: "No plano grátis o Google pode usar o conteúdo enviado para melhorar os produtos dele. Se isso incomoda, ative o faturamento no AI Studio.",
	},
	OPENAI: {
		keyUrl: "https://platform.openai.com/api-keys",
		keyUrlLabel: "Abrir a página de chaves da OpenAI",
		cost: "Pago: créditos a partir de US$ 5",
		costTone: "warning",
		keyPrefix: "sk-",
		steps: [
			"Clique no botão acima e entre ou crie a sua conta (dá pra usar a conta Google). A conta do ChatGPT Plus não inclui créditos de API.",
			"No menu Settings > Billing, cadastre um cartão e compre créditos. Sem crédito a chave não funciona.",
			"Volte para API keys e clique em \"Create new secret key\". Dê um nome qualquer e confirme.",
			"Copie a chave na hora (ela só aparece uma vez) e cole no campo abaixo.",
		],
	},
	ANTHROPIC: {
		keyUrl: "https://console.anthropic.com/settings/keys",
		keyUrlLabel: "Abrir o console da Anthropic",
		cost: "Pago: créditos a partir de US$ 5",
		costTone: "warning",
		keyPrefix: "sk-ant-",
		steps: [
			"Clique no botão acima e entre ou crie a sua conta. A assinatura do Claude Pro não inclui créditos de API.",
			"Em Billing, cadastre um cartão e compre créditos. Sem crédito a chave não funciona.",
			"Em API Keys, clique em \"Create Key\", dê um nome e confirme.",
			"Copie a chave na hora (ela só aparece uma vez) e cole no campo abaixo.",
		],
	},
	OLLAMA: {
		keyUrl: "https://ollama.com/download",
		keyUrlLabel: "Baixar o Ollama",
		cost: "Grátis, roda no seu computador",
		costTone: "success",
		steps: [
			"Baixe e instale o Ollama pelo botão acima.",
			"Abra o terminal (Prompt de Comando no Windows) e rode o comando abaixo para baixar um modelo (uns 5 GB):",
			"Deixe o Ollama aberto. O endereço já vem preenchido; é só clicar em Testar.",
		],
		command: { afterStep: 1, text: "ollama pull llama3.1:8b" },
		note: "Precisa de um computador com pelo menos 8 GB de RAM livres. Em máquinas modestas a análise fica lenta.",
	},
};

export const COMPATIBLE_PRESETS: CompatiblePreset[] = [
	{
		id: "groq",
		label: "Groq",
		baseUrl: "https://api.groq.com/openai/v1",
		keyUrl: "https://console.groq.com/keys",
		keyUrlLabel: "Abrir o console da Groq",
		cost: "Grátis com limite de uso",
		costTone: "success",
		keyPrefix: "gsk_",
		steps: [
			"Clique no botão acima e entre com a conta Google ou GitHub.",
			"Clique em \"Create API Key\", dê um nome e confirme.",
			"Copie a chave e cole no campo abaixo.",
		],
	},
	{
		id: "openrouter",
		label: "OpenRouter",
		baseUrl: "https://openrouter.ai/api/v1",
		keyUrl: "https://openrouter.ai/settings/keys",
		keyUrlLabel: "Abrir o OpenRouter",
		cost: "Tem modelos grátis (terminam em :free)",
		costTone: "success",
		keyPrefix: "sk-or-",
		steps: [
			"Clique no botão acima e crie a sua conta.",
			"Clique em \"Create API Key\", dê um nome e confirme.",
			"Copie a chave e cole no campo abaixo. Para usar sem pagar, escolha um modelo que termina em :free.",
		],
	},
	{
		id: "deepseek",
		label: "DeepSeek",
		baseUrl: "https://api.deepseek.com/v1",
		keyUrl: "https://platform.deepseek.com/api_keys",
		keyUrlLabel: "Abrir a plataforma DeepSeek",
		cost: "Pago, mas barato",
		costTone: "warning",
		steps: [
			"Clique no botão acima e crie a sua conta.",
			"Em Top up, coloque um pouco de crédito.",
			"Em API keys, clique em \"Create new API key\", copie e cole no campo abaixo.",
		],
	},
];

export function presetForBaseUrl(baseUrl: string): CompatiblePreset | undefined {
	const normalized = baseUrl.trim().replace(/\/+$/, "");
	return COMPATIBLE_PRESETS.find((preset) => preset.baseUrl === normalized);
}
