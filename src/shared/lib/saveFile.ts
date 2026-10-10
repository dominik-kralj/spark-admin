/** Hands a downloaded file to the browser to save, under `fileName`. */
export function saveFile(file: Blob, fileName: string): void {
    const url = URL.createObjectURL(file)
    const link = document.createElement('a')
    link.href = url
    link.download = fileName
    // Firefox starts a download only from a link in the document.
    document.body.append(link)
    link.click()
    link.remove()
    // Revoked on the next task: some browsers still read the URL after click returns.
    setTimeout(() => {
        URL.revokeObjectURL(url)
    })
}
