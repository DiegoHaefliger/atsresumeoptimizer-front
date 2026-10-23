type PromptMarkerChipsProps = {
	markers: string[];
	missing: string[];
	onInsert: (marker: string) => void;
};

export function PromptMarkerChips({ markers, missing, onInsert }: PromptMarkerChipsProps) {
	if (markers.length === 0) {
		return null;
	}
	return (
		<div className="prompt-markers">
			<span className="field-hint">Marcadores desta instrução. Clique para inserir onde está o cursor.</span>
			<ul>
				{markers.map((marker) => {
					const isMissing = missing.includes(marker);
					return (
						<li key={marker}>
							<button
								type="button"
								className={`prompt-marker${isMissing ? " prompt-marker-missing" : ""}`}
								title={isMissing ? "Este marcador sumiu do texto" : "Inserir no cursor"}
								onClick={() => onInsert(marker)}
							>
								{marker}
							</button>
						</li>
					);
				})}
			</ul>
			{missing.length > 0 && (
				<p className="alert alert-warning" role="status">
					<span>
						{missing.length === 1 ? "O marcador" : "Os marcadores"} {missing.join(", ")}{" "}
						{missing.length === 1 ? "sumiu" : "sumiram"} do texto. Sem {missing.length === 1 ? "ele" : "eles"}, a IA não recebe
						esse dado.
					</span>
				</p>
			)}
		</div>
	);
}
