import { Text } from '@chakra-ui/react'

import { formatDate } from '@/shared/lib/format'

import type { Validity } from '../lib/validity'
import type { PrivilegedOwner } from '../validators/privilegedOwner'

interface ValidUntilTextProps {
    owner: PrivilegedOwner
    validity: Validity
    as?: 'span' | 'dd'
}

export function ValidUntilText({ owner, validity, as = 'span' }: ValidUntilTextProps) {
    const isExpired = validity === 'expired'

    return (
        <Text
            as={as}
            color={isExpired ? 'red.fg' : undefined}
            fontWeight={isExpired ? 'medium' : undefined}
        >
            {formatDate(owner.validUntil)}
        </Text>
    )
}
