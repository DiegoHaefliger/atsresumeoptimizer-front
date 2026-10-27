import { readFileSync } from 'node:fs'
import { resolve } from 'node:path'
import { beforeEach, describe, expect, it } from 'vitest'

const source = readFileSync(resolve(__dirname, 'extract.js'), 'utf8')

function load() {
	const module = { exports: {} }
	new Function('module', 'document', source)(module, undefined)
	return module.exports
}

const { extract, sectionKey } = load()

const PROFILE_HTML = `
<main>
	<section aria-label="Conteúdo principal">
		<section>
			<img alt="Foto de capa" src="https://media.licdn.com/dms/image/v2/x/profile-displaybackgroundimage-shrink_350_1400/a">
			<img alt="" src="https://media.licdn.com/dms/image/v2/y/profile-framedphoto-shrink_200_200/b">
			<h2><a>Ana Souza</a></h2>
			<p>Engenheira de Software | Java | AWS</p>
			<p>Acme Corp</p>
			<p>São Paulo, Brasil</p><span>·</span><a>Dados de contato</a>
			<p>Acme Corp</p>
			<a>1.200 seguidores</a><span>·</span><a>Mais de 500 conexões</a>
			<button>Disponível para</button>
		</section>
		<section><h2>Sobre</h2><p>Trabalho com sistemas críticos.</p><p>Gosto de ensinar.</p><button>ver mais</button></section>
		<section>
			<h2>Em destaque</h2>
			<ul><li><p>Post</p><p>Artigo sobre Kafka</p></li><li><p>Link</p><p>Meu projeto</p></li></ul>
		</section>
		<section>
			<h2>Atividades</h2>
			<p>1.200 seguidores</p><p>Criar publicação</p>
			<hr role="presentation"><p>Ana Souza</p><p>Publiquei sobre testes</p>
			<hr role="presentation"><p>Ana Souza</p><p>Outro post</p>
		</section>
		<section>
			<h2>Experiência</h2>
			<div><p>Engenheira Sênior</p><p>Acme Corp · Tempo integral</p><p>jan. de 2022 - presente · 4 anos</p><p>São Paulo, Brasil · Remoto</p><p>- Reduzi custo em 30%.</p><p>- Liderei 5 pessoas.</p></div>
			<hr role="presentation">
			<div><p>Globex</p><p>Total 3 anos</p>
				<p>Tech Lead</p><p>Tempo integral</p><p>jan. de 2020 - dez. de 2021 · 2 anos</p><p>Remoto</p><p>- Migrei para microsserviços.</p>
				<p>Desenvolvedora</p><p>jan. de 2018 - dez. de 2019 · 2 anos</p>
			</div>
			<hr role="presentation"><a>Mostrar todas as 5 experiências</a>
		</section>
		<section>
			<h2>Formação acadêmica</h2>
			<div><p>USP</p><p>Bacharelado, Ciência da Computação</p><p>2012 - 2016</p></div>
		</section>
		<section><h2>Projetos (1)</h2><div><p>Gateway</p><p>mai. de 2026 - set. de 2026</p><p>Triagem de erros.</p></div></section>
	</section>
</main>`

function render(html, title = 'Ana Souza | LinkedIn') {
	document.body.innerHTML = html
	document.title = title
}

const profileLocation = { origin: 'https://www.linkedin.com', pathname: '/in/ana-souza/' }

describe('extract on the profile page', () => {
	beforeEach(() => render(PROFILE_HTML))

	it('reads the top card', () => {
		const { profile } = extract(document, profileLocation)

		expect(profile.fullName).toBe('Ana Souza')
		expect(profile.headline).toBe('Engenheira de Software | Java | AWS')
		expect(profile.location).toBe('São Paulo, Brasil')
		expect(profile.followers).toBe('1.200 seguidores')
		expect(profile.connections).toBe('Mais de 500 conexões')
		expect(profile.customUrl).toBe('linkedin.com/in/ana-souza')
		expect(profile.profileUrl).toBe('https://www.linkedin.com/in/ana-souza/')
	})

	it('reads about, featured and activity without action buttons or the follower header', () => {
		const { profile, found } = extract(document, profileLocation)

		expect(profile.about).toBe('Trabalho com sistemas críticos.\nGosto de ensinar.')
		expect(profile.featured).toEqual(['Post - Artigo sobre Kafka', 'Link - Meu projeto'])
		expect(profile.recentActivity).toEqual(['Ana Souza\nPubliquei sobre testes', 'Ana Souza\nOutro post'])
		expect(found).toEqual(expect.arrayContaining(['about', 'featured', 'activity', 'experience', 'education', 'projects']))
	})

	it('reads a single-role experience with period, location and description', () => {
		const { profile } = extract(document, profileLocation)

		expect(profile.experiences[0]).toEqual({
			title: 'Engenheira Sênior',
			organization: 'Acme Corp · Tempo integral',
			period: 'jan. de 2022 - presente · 4 anos',
			location: 'São Paulo, Brasil · Remoto',
			description: '- Reduzi custo em 30%.\n- Liderei 5 pessoas.',
		})
	})

	it('splits a company with several roles into one entry per role', () => {
		const { profile } = extract(document, profileLocation)

		expect(profile.experiences).toHaveLength(3)
		expect(profile.experiences[1]).toMatchObject({ title: 'Tech Lead', organization: 'Globex', period: 'jan. de 2020 - dez. de 2021 · 2 anos' })
		expect(profile.experiences[2]).toMatchObject({ title: 'Desenvolvedora', organization: 'Globex' })
	})

	it('reads education with the school first and projects with a count in the heading', () => {
		const { profile } = extract(document, profileLocation)

		expect(profile.educations[0]).toMatchObject({ organization: 'USP', title: 'Bacharelado, Ciência da Computação', period: '2012 - 2016' })
		expect(profile.projects[0]).toMatchObject({ title: 'Gateway', period: 'mai. de 2026 - set. de 2026', description: 'Triagem de erros.' })
	})

	it('finds the photo and the banner', () => {
		const result = extract(document, profileLocation)

		expect(result.photoUrl).toContain('profile-framedphoto')
		expect(result.bannerUrl).toContain('profile-displaybackgroundimage')
	})

	it('leaves out sections that are not on the page', () => {
		const { profile, found } = extract(document, profileLocation)

		expect(found).not.toContain('skills')
		expect(profile.skills).toBeUndefined()
	})
})

describe('extract on a details page', () => {
	it('reads the skills list and ignores the duplicated text', () => {
		render(
			`<main><h1>Competências</h1><ul>
				<li><p>Java</p><p>Java</p><p>12 recomendações</p></li>
				<li><p>Kafka</p><p>Kafka</p></li>
			</ul></main>`,
		)

		const result = extract(document, { origin: 'https://www.linkedin.com', pathname: '/in/ana-souza/details/skills/' })

		expect(result.page).toBe('details:skills')
		expect(result.profile.skills).toEqual(['Java', 'Kafka'])
		expect(result.profile.profileUrl).toBe('https://www.linkedin.com/in/ana-souza/')
	})

	it('reads languages as name and proficiency', () => {
		render('<main><h1>Idiomas</h1><ul><li><p>Inglês</p><p>Profissional avançado</p></li></ul></main>')

		const result = extract(document, { origin: 'https://www.linkedin.com', pathname: '/in/ana-souza/details/languages/' })

		expect(result.profile.languages).toEqual(['Inglês - Profissional avançado'])
	})
})

describe('custom url', () => {
	it('treats the generated slug with a random suffix as not customized', () => {
		render('<main></main>', 'Ana | LinkedIn')

		const result = extract(document, { origin: 'https://www.linkedin.com', pathname: '/in/ana-souza-1a2b3c4d5/' })

		expect(result.profile.customUrl).toBeNull()
	})
})

describe('sectionKey', () => {
	it('recognizes headings in Portuguese, English and Spanish', () => {
		expect(sectionKey('Experiência')).toBe('experience')
		expect(sectionKey('Education')).toBe('education')
		expect(sectionKey('Licencias y certificaciones')).toBe('certifications')
		expect(sectionKey('Projetos (3)')).toBe('projects')
		expect(sectionKey('Sugestões para você')).toBeNull()
	})
})
