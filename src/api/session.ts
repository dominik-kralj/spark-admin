let accessToken: string | null = null

// Memory only until #5 decides where the session lives.
export function setAccessToken(token: string | null): void {
    accessToken = token
}

export function getAccessToken(): string | null {
    return accessToken
}
