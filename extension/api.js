const SNAPSHOT_PATH = '/api/v1/linkedin/snapshots'
const PAIRING_HEADER = 'X-Pairing-Token'

function readAsBase64(blob) {
	return new Promise((resolve, reject) => {
		const reader = new FileReader()
		reader.onload = () => resolve(String(reader.result).split(',')[1])
		reader.onerror = () => reject(reader.error)
		reader.readAsDataURL(blob)
	})
}

async function downloadImage(url) {
	const response = await fetch(url)
	if (!response.ok) {
		return null
	}
	const blob = await response.blob()
	return { base64: await readAsBase64(blob), mimeType: blob.type }
}

export async function buildSnapshotBody(draft, download = downloadImage) {
	const [photo, banner] = await Promise.all([
		draft.photoUrl ? download(draft.photoUrl) : null,
		draft.bannerUrl ? download(draft.bannerUrl) : null,
	])
	return {
		profile: draft.profile,
		photoBase64: photo ? photo.base64 : null,
		photoMimeType: photo ? photo.mimeType : null,
		bannerBase64: banner ? banner.base64 : null,
		bannerMimeType: banner ? banner.mimeType : null,
	}
}

export async function sendSnapshot({ serverUrl, token, draft }, download = downloadImage, doFetch = fetch) {
	const body = await buildSnapshotBody(draft, download)
	const response = await doFetch(serverUrl.replace(/\/+$/, '') + SNAPSHOT_PATH, {
		method: 'POST',
		headers: { 'Content-Type': 'application/json', [PAIRING_HEADER]: token },
		body: JSON.stringify(body),
	})
	if (!response.ok) {
		const problem = await response.json().catch(() => ({}))
		throw new Error(problem.detail || `Falha ${response.status} ao enviar o perfil.`)
	}
	return response.json()
}
