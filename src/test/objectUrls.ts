import { onTestFinished } from 'vitest'

type ObjectUrlFunction = 'createObjectURL' | 'revokeObjectURL'

function replaceUntilTestEnds(name: ObjectUrlFunction, value: (arg: never) => unknown) {
    const original = Object.getOwnPropertyDescriptor(URL, name)
    Object.defineProperty(URL, name, { value, configurable: true, writable: true })
    onTestFinished(() => {
        if (original === undefined) Reflect.deleteProperty(URL, name)
        else Object.defineProperty(URL, name, original)
    })
}

/** Records object URLs for this test, since jsdom cannot make or revoke them. */
export function stubObjectUrls() {
    const files = new Map<string, Blob>()
    const revoked: string[] = []
    replaceUntilTestEnds('createObjectURL', (file: Blob) => {
        const url = `blob:file-${String(files.size + 1)}`
        files.set(url, file)

        return url
    })
    replaceUntilTestEnds('revokeObjectURL', (url: string) => {
        revoked.push(url)
    })

    return { files, revoked }
}
