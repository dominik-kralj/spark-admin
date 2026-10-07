import { useMediaQuery } from '@chakra-ui/react'

export type ShellLayout = 'phone' | 'tablet' | 'desktop'

export function useShellLayout(): ShellLayout {
    // Chakra's md and lg breakpoints. ssr: false reads the real width on the first render.
    const [isTabletUp, isDesktop] = useMediaQuery(['(min-width: 768px)', '(min-width: 1024px)'], {
        ssr: false,
    })

    if (isDesktop) return 'desktop'

    return isTabletUp ? 'tablet' : 'phone'
}
