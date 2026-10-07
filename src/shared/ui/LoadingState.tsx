import { Box, Grid, Skeleton, Stack, Text } from '@chakra-ui/react'

interface LoadingStateProps {
    label: string
    /** Relative width of each table column, in fr. */
    columnWidths: number[]
}

const tableRows = [1, 2, 3]
const cards = [1, 2]

export function LoadingState({ label, columnWidths }: LoadingStateProps) {
    const gridTemplateColumns = columnWidths.map((width) => `${String(width)}fr`).join(' ')

    return (
        <Box layerStyle={{ md: 'panel' }} overflow="hidden">
            <Box hideBelow="md" aria-hidden="true">
                <Box h="11" bg="bg.subtle" />
                {tableRows.map((row) => (
                    <Grid
                        key={row}
                        data-skeleton-row
                        gridTemplateColumns={gridTemplateColumns}
                        gap="8"
                        alignItems="center"
                        h="52px"
                        px="4"
                        borderTopWidth="1px"
                    >
                        {columnWidths.map((_, column) => (
                            <Skeleton key={column} h="3" />
                        ))}
                    </Grid>
                ))}
            </Box>

            <Stack hideFrom="md" aria-hidden="true" gap="2">
                {cards.map((card) => (
                    <Stack key={card} layerStyle="panel" gap="3.5" p="4">
                        <Skeleton w="120px" h="4" />
                        <Skeleton h="3" />
                        <Skeleton h="11" bg="bg.muted" borderRadius="md" />
                    </Stack>
                ))}
            </Stack>

            <Text
                role="status"
                mt={{ base: '3', md: '0' }}
                px={{ md: '4' }}
                py={{ md: '3' }}
                borderTopWidth={{ md: '1px' }}
                textStyle={{ base: 'sm', md: 'md' }}
                color="fg.muted"
            >
                {label}
            </Text>
        </Box>
    )
}
