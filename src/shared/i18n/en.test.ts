// @vitest-environment node
import { describe, expect, it } from 'vitest'

import type { Dictionary } from './dictionary'
import { en } from './en'

describe('English dictionary', () => {
    it('must have every Croatian key, which tsc checks', () => {
        // @ts-expect-error A dictionary missing sections the Croatian one has fails to compile.
        const incomplete: Dictionary = { app: en.app }

        expect(incomplete).not.toHaveProperty('notFound')
    })

    it('uses English plural forms for the zone total', () => {
        expect(en.zones.total(1)).toBe('1 zone in total')
        expect(en.zones.total(2)).toBe('2 zones in total')
    })
})
