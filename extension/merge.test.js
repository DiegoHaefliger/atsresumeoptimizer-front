import { describe, expect, it } from 'vitest'
import { capturedSections, emptyDraft, mergeCapture, missingSections } from './merge.js'

describe('mergeCapture', () => {
	it('accumulates sections from several pages and keeps earlier ones when a page has none', () => {
		const first = mergeCapture(emptyDraft(), {
			profile: { headline: 'Dev', experiences: [{ title: 'Dev' }], skills: [] },
			photoUrl: 'photo',
			bannerUrl: null,
		})
		const second = mergeCapture(first, { profile: { skills: ['Java'], experiences: [] }, photoUrl: null, bannerUrl: 'banner' })

		expect(second.profile.experiences).toHaveLength(1)
		expect(second.profile.skills).toEqual(['Java'])
		expect(second.photoUrl).toBe('photo')
		expect(second.bannerUrl).toBe('banner')
	})

	it('lists captured and missing sections', () => {
		const draft = mergeCapture(emptyDraft(), { profile: { headline: 'Dev', about: 'Sobre' }, photoUrl: 'p', bannerUrl: null })

		expect(capturedSections(draft)).toEqual(['headline', 'about', 'photo'])
		expect(missingSections(draft)).toContain('banner')
		expect(missingSections(draft)).toContain('skills')
		expect(missingSections(draft)).not.toContain('about')
	})
})
