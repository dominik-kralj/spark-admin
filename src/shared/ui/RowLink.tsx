import { Link, type LinkProps } from '@chakra-ui/react'
import type { ReactNode } from 'react'
import { Link as RouterLink, useLocation } from 'react-router'

import { detailPath, fromListState } from '@/shared/lib/detailLink'

interface RowLinkProps extends Omit<LinkProps, 'asChild' | 'href'> {
    /** The list's path; the detail opens over it. */
    listPath: string
    id: string
    children: ReactNode
}

/** A list row's link to its detail; `visibleRowLink` finds it again to return focus. */
export function RowLink({ listPath, id, children, ...linkProps }: RowLinkProps) {
    const { search } = useLocation()

    return (
        <Link asChild {...linkProps}>
            <RouterLink
                to={detailPath(listPath, id, search)}
                state={fromListState}
                data-row-link={id}
            >
                {children}
            </RouterLink>
        </Link>
    )
}
