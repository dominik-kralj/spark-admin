// @vitest-environment node
import { ESLint, Linter } from 'eslint'
import { describe, expect, it } from 'vitest'

// Runs only the boundary rule, so snippets need no type info and paths need not exist.
async function lintImport(code: string, filePath: string): Promise<(string | null)[]> {
    const config = (await new ESLint().calculateConfigForFile(filePath)) as {
        rules: Linter.RulesRecord
    }
    const rule = config.rules['no-restricted-imports']
    const messages = new Linter().verify(
        code,
        [
            {
                files: ['**/*.{ts,tsx}'],
                rules: rule === undefined ? {} : { 'no-restricted-imports': rule },
            },
        ],
        filePath,
    )

    return messages.map((m) => m.ruleId)
}

describe('API module boundary', () => {
    it('rejects a deep @/api import from a feature', async () => {
        const messages = await lintImport(
            "import { request } from '@/api/client'",
            'src/features/zones/ZonesPage.tsx',
        )

        expect(messages).toEqual(['no-restricted-imports'])
    })

    it('rejects a relative deep import into src/api', async () => {
        const messages = await lintImport(
            "import { request } from '../../api/client'",
            'src/features/zones/ZonesPage.tsx',
        )

        expect(messages).toEqual(['no-restricted-imports'])
    })

    it('rejects a relative import of the index', async () => {
        const messages = await lintImport(
            "import { ApiError } from '../../api'",
            'src/features/zones/ZonesPage.tsx',
        )

        expect(messages).toEqual(['no-restricted-imports'])
    })

    it('allows a package subpath that contains api', async () => {
        await expect(
            lintImport("import x from 'some-lib/api/x'", 'src/features/zones/ZonesPage.tsx'),
        ).resolves.toEqual([])
    })

    it('allows the public index', async () => {
        await expect(
            lintImport("import { ApiError } from '@/api'", 'src/features/zones/ZonesPage.tsx'),
        ).resolves.toEqual([])
    })

    it.each(['src/api/zones.ts', 'src/mocks/handlers.ts'])(
        'allows deep imports inside %s',
        async (filePath) => {
            await expect(
                lintImport("import { request } from '@/api/client'", filePath),
            ).resolves.toEqual([])
        },
    )
})
