import { Text } from '@chakra-ui/react'

import { formatDate } from '@/shared/lib/format'

import type { Validity } from '../lib/validity'

interface ValidUntilTextProps {
    validUntil: Date
    validity: Validity
    as?: 'span' | 'dd'
}

export function ValidUntilText({ validUntil, validity, as = 'span' }: ValidUntilTextProps) {
    const isExpired = validity === 'expired'

    return (
        <Text
            as={as}
            color={isExpired ? 'red.fg' : undefined}
            fontWeight={isExpired ? 'medium' : undefined}
        >
            {formatDate(validUntil)}
        </Text>
    )
}
