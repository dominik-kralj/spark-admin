export function inactiveTint(isActive: boolean): string | undefined {
    return isActive ? undefined : 'bg.subtle'
}
