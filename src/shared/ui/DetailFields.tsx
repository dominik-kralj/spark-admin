import { Box, Grid, Text, type GridProps } from '@chakra-ui/react'
import type { ReactNode } from 'react'

export interface DetailField {
    label: string
    value: ReactNode
}

export function FieldTerm({ children }: { children: string }) {
    return (
        <Text as="dt" fontSize="caption" color="fg.muted">
            {children}
        </Text>
    )
}

interface DetailFieldsProps extends Omit<GridProps, 'children'> {
    fields: DetailField[]
}

/** A detail's fields as a description list in two columns. */
export function DetailFields({ fields, ...gridProps }: DetailFieldsProps) {
    return (
        <Grid
            as="dl"
            templateColumns="repeat(2, minmax(0, 1fr))"
            columnGap="4"
            rowGap="4"
            {...gridProps}
        >
            {fields.map(({ label, value }) => (
                <Box key={label}>
                    <FieldTerm>{label}</FieldTerm>
                    <Box as="dd">{value}</Box>
                </Box>
            ))}
        </Grid>
    )
}
