import { afterEach, describe, expect, it, vi } from 'vitest'

import { stubObjectUrls } from '@/test/objectUrls'

import { saveFile } from './saveFile'

describe('saveFile', () => {
    afterEach(() => {
        vi.useRealTimers()
        vi.restoreAllMocks()
    })

    it('downloads the file under its name, then revokes the object URL', () => {
        vi.useFakeTimers()
        const { files, revoked } = stubObjectUrls()
        const clicked: { href: string; download: string; isConnected: boolean }[] = []
        vi.spyOn(HTMLAnchorElement.prototype, 'click').mockImplementation(function (
            this: HTMLAnchorElement,
        ) {
            clicked.push({
                href: this.href,
                download: this.download,
                isConnected: this.isConnected,
            })
        })
        const file = new Blob(['%PDF-1.4'], { type: 'application/pdf' })

        saveFile(file, 'izvjestaj.pdf')

        expect(files.get('blob:file-1')).toBe(file)
        expect(clicked).toEqual([
            { href: 'blob:file-1', download: 'izvjestaj.pdf', isConnected: true },
        ])
        expect(document.querySelector('a[download]')).toBeNull()

        vi.runAllTimers()

        expect(revoked).toEqual(['blob:file-1'])
    })
})
