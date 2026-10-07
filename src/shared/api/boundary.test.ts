// @vitest-environment node
import { ESLint, Linter } from 'eslint'
import { beforeAll, describe, expect, it } from 'vitest'

const eslint = new ESLint()

// Runs only the boundary rule, so snippets need no type info and paths need not exist.
async function lintImport(code: string, filePath: string): Promise<(string | null)[]> {
    const config = (await eslint.calculateConfigForFile(filePath)) as {
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

describe('import boundaries', () => {
    // Loading the flat config and its plugins is a one-off cost that can pass 5 s under load.
    beforeAll(async () => {
        await eslint.calculateConfigForFile('src/features/zones/ZonesPage.tsx')
    }, 30_000)

    it('rejects a deep @/shared/api import from a feature', async () => {
        const messages = await lintImport(
            "import { request } from '@/shared/api/client'",
            'src/features/zones/ZonesPage.tsx',
        )

        expect(messages).toEqual(['no-restricted-imports'])
    })

    it('rejects a relative deep import into shared/api', async () => {
        const messages = await lintImport(
            "import { request } from '../../shared/api/client'",
            'src/features/zones/ZonesPage.tsx',
        )

        expect(messages).toEqual(['no-restricted-imports'])
    })

    it('rejects a relative import of the index', async () => {
        const messages = await lintImport(
            "import { ApiError } from '../../shared/api'",
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
            lintImport(
                "import { ApiError } from '@/shared/api'",
                'src/features/zones/ZonesPage.tsx',
            ),
        ).resolves.toEqual([])
    })

    it('rejects a deep @/shared/api import from shared code', async () => {
        const messages = await lintImport(
            "import { request } from '@/shared/api/client'",
            'src/shared/lib/format.ts',
        )

        expect(messages).toEqual(['no-restricted-imports'])
    })

    it('rejects an import from another feature', async () => {
        const messages = await lintImport(
            "import { getSession } from '@/features/auth/api/useAuth'",
            'src/features/zones/ZonesPage.tsx',
        )

        expect(messages).toEqual(['no-restricted-imports'])
    })

    it('allows a feature its own api folder', async () => {
        await expect(
            lintImport(
                "import { useAuth } from '../api/useAuth'",
                'src/features/auth/components/LoginPage.tsx',
            ),
        ).resolves.toEqual([])
    })

    it('allows a feature its own validators', async () => {
        await expect(
            lintImport(
                "import { toSession } from '../validators/login'",
                'src/features/auth/api/useAuth.ts',
            ),
        ).resolves.toEqual([])
    })

    it.each(['src/shared/api/client.ts', 'src/mocks/handlers.ts', 'src/test/session.ts'])(
        'allows deep imports inside %s',
        async (filePath) => {
            await expect(
                lintImport("import { request } from '@/shared/api/client'", filePath),
            ).resolves.toEqual([])
        },
    )
})
