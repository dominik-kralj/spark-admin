let accessToken: string | null = null

/**
 * Sets the JWT sent as the bearer token on every request; null signs out.
 * Where the token lives between reloads is decided with the session (#5).
 */
export function setAccessToken(token: string | null): void {
    accessToken = token
}

export function getAccessToken(): string | null {
    return accessToken
}
