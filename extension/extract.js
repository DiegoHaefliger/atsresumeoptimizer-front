(function (root) {
	const HEADINGS = {
		about: ['sobre', 'about', 'acerca de'],
		featured: ['em destaque', 'featured', 'destacados'],
		activity: ['atividades', 'atividade', 'activity', 'actividad'],
		experience: ['experiencia', 'experience'],
		education: ['formacao academica', 'formacao', 'education', 'educacion'],
		skills: ['competencias', 'skills', 'aptitudes'],
		certifications: ['licencas e certificados', 'licenses & certifications', 'licenses and certifications', 'licencias y certificaciones', 'certifications'],
		languages: ['idiomas', 'languages'],
		projects: ['projetos', 'projects', 'proyectos'],
		publications: ['publicacoes', 'publications', 'publicaciones'],
		recommendations: ['recomendacoes', 'recommendations', 'recomendaciones'],
	}
	const PROFILE_FIELD = { experience: 'experiences', education: 'educations', activity: 'recentActivity' }
	const MONTHS = 'jan|fev|mar|abr|mai|jun|jul|ago|set|out|nov|dez|feb|apr|may|aug|sep|oct|dec|ene|dic'
	const PERIOD = new RegExp(`(\\b(19|20)\\d{2}\\b|\\b(${MONTHS})\\b\\.?)`, 'i')
	const ACTION_LINE = /^(exibir|mostrar|ver |show |see |seguir|conectar|follow|connect|editar|adicionar)/i
	const EMPLOYMENT_TYPE = /^(tempo integral|meio per[ií]odo|aut[oô]nomo|freelance|contrato|est[aá]gio|full-time|part-time|self-employed|contract|internship|jornada)/i
	const CONTACT_LINE = /dados de contato|contact info/i
	const SEPARATOR_LINE = /^[·•]$|^\(?\d+º/
	const FOLLOWER_LINE = /seguidores|followers/i
	const MAX_PERIOD_LENGTH = 80
	const MAX_ACTIVITY = 10
	const MAX_ACTIVITY_CHARS = 600

	function fold(text) {
		return text.normalize('NFD').replace(/[\u0300-\u036f]/g, '').toLowerCase().replace(/\s*\(\d+\)\s*$/, '').trim()
	}

	function sectionKey(heading) {
		const folded = fold(heading)
		return Object.keys(HEADINGS).find((key) => HEADINGS[key].includes(folded)) || null
	}

	function isVisibleText(node) {
		const parent = node.parentElement
		return parent && !parent.closest('button, svg, script, style')
	}

	function buckets(container) {
		const result = [[]]
		const walker = container.ownerDocument.createTreeWalker(container, 1 | 4)
		for (let node = walker.nextNode(); node; node = walker.nextNode()) {
			const last = result[result.length - 1]
			if (node.nodeType === 1) {
				const topLevelItem = node.tagName === 'LI' && !node.parentElement.closest('li')
				if ((node.tagName === 'HR' || topLevelItem) && last.length) {
					result.push([])
				}
			} else if (isVisibleText(node)) {
				const text = node.textContent.replace(/\s+/g, ' ').trim()
				if (text && text !== last[last.length - 1]) {
					last.push(text)
				}
			}
		}
		return result.map((lines) => lines.filter((line) => !ACTION_LINE.test(line))).filter((lines) => lines.length)
	}

	function periodIndexes(lines) {
		return lines.flatMap((line, index) => (line.length < MAX_PERIOD_LENGTH && PERIOD.test(line) && /\d/.test(line) ? [index] : []))
	}

	function entryFrom(lines, { organizationFirst = false, withLocation = false } = {}) {
		const periodAt = periodIndexes(lines)[0]
		const head = periodAt === undefined ? lines.slice(0, 2) : lines.slice(0, periodAt)
		const tail = periodAt === undefined ? lines.slice(2) : lines.slice(periodAt + 1)
		const [first, second] = head
		const hasLocation = withLocation && tail.length > 0 && tail[0].length < MAX_PERIOD_LENGTH && !tail[0].startsWith('-')
		return {
			title: organizationFirst ? second || first : first,
			organization: organizationFirst ? first : second || null,
			period: periodAt === undefined ? null : lines[periodAt],
			location: hasLocation ? tail[0] : null,
			description: (hasLocation ? tail.slice(1) : tail).join('\n') || null,
		}
	}

	function experienceEntries(lines) {
		const periods = periodIndexes(lines)
		if (periods.length < 2) {
			return [entryFrom(lines, { withLocation: true })]
		}
		const starts = periods.map((periodAt) => (EMPLOYMENT_TYPE.test(lines[periodAt - 1]) ? periodAt - 2 : periodAt - 1))
		return starts.map((start, index) => ({
			...entryFrom(lines.slice(start, starts[index + 1]), { withLocation: true }),
			organization: lines[0],
		}))
	}

	function parseItems(key, items) {
		switch (key) {
			case 'experience':
				return items.flatMap(experienceEntries)
			case 'education':
				return items.map((lines) => entryFrom(lines, { organizationFirst: true }))
			case 'certifications':
			case 'projects':
			case 'publications':
				return items.map((lines) => entryFrom(lines))
			case 'skills':
				return items.map((lines) => lines[0])
			case 'languages':
				return items.map((lines) => lines.slice(0, 2).join(' - '))
			case 'featured':
				return items.map((lines) => lines.slice(0, 3).join(' - '))
			case 'activity':
				return items.filter((lines) => !FOLLOWER_LINE.test(lines[0])).slice(0, MAX_ACTIVITY).map((lines) => lines.join('\n').slice(0, MAX_ACTIVITY_CHARS))
			default:
				return items.map((lines) => lines.join('\n'))
		}
	}

	function parseSection(key, container) {
		const heading = container.querySelector('h1, h2')
		const items = buckets(container)
			.map((lines) => (heading && fold(lines[0]) === fold(heading.textContent) ? lines.slice(1) : lines))
			.filter((lines) => lines.length)
		return key === 'about' ? items.map((lines) => lines.join('\n')).join('\n') || null : parseItems(key, items)
	}

	function sections(doc) {
		return [...doc.querySelectorAll('main section')]
	}

	function topCard(doc) {
		const name = (doc.title.split('|')[0] || '').trim()
		const candidates = sections(doc).filter((section) => [...section.querySelectorAll('h1, h2')].some((h) => h.textContent.trim() === name))
		const card = candidates.sort((a, b) => a.textContent.length - b.textContent.length)[0]
		if (!card || !name) {
			return {}
		}
		const lines = buckets(card).flat().filter((line) => line !== name)
		const contactAt = lines.findIndex((line) => CONTACT_LINE.test(line))
		const beforeContact = contactAt > 0 && lines[contactAt - 1] === '·' ? lines[contactAt - 2] : lines[contactAt - 1]
		return {
			fullName: name,
			headline: lines.find((line) => !SEPARATOR_LINE.test(line)) || null,
			location: contactAt > 0 ? beforeContact : null,
			followers: lines.find((line) => FOLLOWER_LINE.test(line)) || null,
			connections: lines.find((line) => /conex[õo]es|connections/i.test(line)) || null,
		}
	}

	function customUrl(location) {
		const match = /\/in\/([^/?#]+)/.exec(location.pathname)
		if (!match) {
			return null
		}
		const slug = decodeURIComponent(match[1])
		const suffix = slug.split('-').pop()
		const autoGenerated = slug.includes('-') && suffix.length >= 8 && /\d/.test(suffix)
		return autoGenerated ? null : `linkedin.com/in/${slug}`
	}

	function images(doc) {
		const imgs = [...doc.querySelectorAll('main img')]
		const banner = imgs.find((img) => /profile-displaybackgroundimage/.test(img.src) || /^(foto de )?capa|cover/i.test(img.alt))
		const photo = imgs.find((img) => /profile-(framedphoto|displayphoto)/.test(img.src))
		return { photoUrl: photo ? photo.src : null, bannerUrl: banner ? banner.src : null }
	}

	function firstSectionPerKey(doc) {
		const byKey = new Map()
		for (const section of sections(doc)) {
			const heading = section.querySelector('h2')
			const key = heading && sectionKey(heading.textContent)
			if (key && !byKey.has(key)) {
				byKey.set(key, section)
			}
		}
		return [...byKey.entries()]
	}

	function detailTarget(doc, slug) {
		const main = doc.querySelector('main')
		const key = sectionKey(slug.replace(/-/g, ' ')) || sectionKey((main && main.querySelector('h1, h2') || { textContent: '' }).textContent)
		return key && main ? [[key, main]] : []
	}

	function extract(doc, location) {
		const detail = /\/details\/([^/]+)/.exec(location.pathname)
		const targets = detail
			? detailTarget(doc, detail[1])
			: firstSectionPerKey(doc)
		const profile = {
			...(detail ? {} : topCard(doc)),
			profileUrl: location.origin + location.pathname.replace(/\/(details|overlay)\/.*/, '/'),
			customUrl: customUrl(location),
		}
		const found = []
		for (const [key, container] of targets) {
			profile[PROFILE_FIELD[key] || key] = parseSection(key, container)
			found.push(key)
		}
		return { page: detail ? `details:${detail[1]}` : 'profile', profile, found, ...(detail ? {} : images(doc)) }
	}

	if (typeof module === 'object' && module.exports) {
		module.exports = { extract, sectionKey, fold }
	}
	return typeof document !== 'undefined' && root.location ? extract(document, root.location) : null
})(typeof globalThis !== 'undefined' ? globalThis : this)
