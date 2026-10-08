type Listener = () => void

let message = ''
const listeners = new Set<Listener>()

/** Puts text in the page's live region; '' clears it, so the next message is announced. */
export function announce(text: string): void {
    message = text
    for (const listener of listeners) listener()
}

export function getAnnouncement(): string {
    return message
}

export function subscribeToAnnouncements(listener: Listener): () => void {
    listeners.add(listener)

    return () => {
        listeners.delete(listener)
    }
}
