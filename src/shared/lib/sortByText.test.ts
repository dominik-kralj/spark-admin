import { describe, expect, it } from 'vitest'

import { sortByText } from './sortByText'

const byItself = (text: string) => [text]

describe('sortByText', () => {
    it('sorts in Croatian order, ignoring case', () => {
        expect(sortByText(['Šimić', 'cvitan', 'Čop', 'Sabo', 'Cvitan'], byItself, 'asc')).toEqual([
            'cvitan',
            'Cvitan',
            'Čop',
            'Sabo',
            'Šimić',
        ])
    })

    it('reverses the order for desc', () => {
        expect(sortByText(['B', 'A', 'C'], byItself, 'desc')).toEqual(['C', 'B', 'A'])
    })

    it('breaks a tie with the next text', () => {
        const people = [
            { surname: 'Horvat', name: 'Marko' },
            { surname: 'Babić', name: 'Ivan' },
            { surname: 'Horvat', name: 'Ana' },
        ]

        expect(
            sortByText(people, ({ surname, name }) => [surname, name], 'asc').map(
                ({ name }) => name,
            ),
        ).toEqual(['Ivan', 'Ana', 'Marko'])
    })

    it('orders numbers in the text by value only when asked', () => {
        const codes = ['ZONA10', 'ZONA2']

        expect(sortByText(codes, byItself, 'asc')).toEqual(['ZONA10', 'ZONA2'])
        expect(sortByText(codes, byItself, 'asc', { numeric: true })).toEqual(['ZONA2', 'ZONA10'])
    })

    it('leaves the list it was given as it was', () => {
        const codes = ['B', 'A']

        sortByText(codes, byItself, 'asc')

        expect(codes).toEqual(['B', 'A'])
    })
})
