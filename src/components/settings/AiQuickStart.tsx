type AiQuickStartProps = {
	onStart: () => void;
};

export function AiQuickStart({ onStart }: AiQuickStartProps) {
	return (
		<div className="ai-quick-start">
			<div>
				<strong>Primeira vez? Comece pelo Google Gemini.</strong>
				<p>
					É grátis, não pede cartão e leva uns 2 minutos: basta ter uma conta Google. Depois, se quiser, dá pra trocar
					por outro provedor.
				</p>
			</div>
			<button type="button" onClick={onStart}>
				Configurar o Gemini
			</button>
		</div>
	);
}
