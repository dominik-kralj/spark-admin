import { Box, Grid, Text } from '@chakra-ui/react'

import type { DetailField } from './DetailFields'

// Two columns on a phone; one when the text is zoomed and two would not fit.
const cardColumns = 'repeat(auto-fit, minmax(min(100%, 7.5rem), 1fr))'

/** A phone card's fields as a description list. */
export function CardFields({ fields }: { fields: DetailField[] }) {
    return (
        <Grid as="dl" templateColumns={cardColumns} gap="3">
            {fields.map(({ label, value }) => (
                <Box key={label}>
                    <Text as="dt" fontSize="caption" color="fg.muted">
                        {label}
                    </Text>
                    <Box as="dd">{value}</Box>
                </Box>
            ))}
        </Grid>
    )
}
