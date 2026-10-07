// @vitest-environment node
import { describe, expect, it } from 'vitest'

import { plural } from './plural'

const zone = { one: 'zona', few: 'zone', other: 'zona' }

describe('plural', () => {
    it.each([
        [1, 'zona'],
        [2, 'zone'],
        [4, 'zone'],
        [5, 'zona'],
        [11, 'zona'],
        [12, 'zona'],
        [21, 'zona'],
        [22, 'zone'],
        [0, 'zona'],
    ])('picks the Croatian form for %i', (count, form) => {
        expect(plural(count, zone)).toBe(form)
    })
})
