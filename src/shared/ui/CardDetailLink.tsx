import { HStack, Text } from '@chakra-ui/react'
import { ChevronRight } from 'lucide-react'

import { useStrings } from '@/shared/i18n/useStrings'

import { RowLink } from './RowLink'

interface CardDetailLinkProps {
    listPath: string
    id: string
    plate: string
}

/** A phone card's top line, the plate and Detalji: one 48 px link to the detail. */
export function CardDetailLink({ listPath, id, plate }: CardDetailLinkProps) {
    const t = useStrings()

    return (
        <RowLink
            listPath={listPath}
            id={id}
            display="flex"
            flexWrap="wrap"
            columnGap="3"
            justifyContent="space-between"
            alignItems="center"
            minH="12"
            textDecoration="none"
        >
            <Text as="span" textStyle="plate" fontSize="1.0625rem" fontWeight="semibold">
                {plate}
            </Text>
            <HStack as="span" gap="1" textStyle="sm" fontWeight="semibold">
                {t.details.open}
                <ChevronRight size="16" aria-hidden="true" />
            </HStack>
        </RowLink>
    )
}
