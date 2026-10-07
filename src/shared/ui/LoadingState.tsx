import { Box, Grid, Skeleton, Stack, Text } from '@chakra-ui/react'

interface LoadingStateProps {
    label: string
    columns: number
}

const tableRows = [1, 2, 3]
const cards = [1, 2]

export function LoadingState({ label, columns }: LoadingStateProps) {
    const cells = Array.from({ length: columns }, (_, index) => index)

    return (
        <Box
            aria-busy="true"
            bg={{ md: 'bg' }}
            borderWidth={{ md: '1px' }}
            borderColor="border"
            borderRadius="lg"
            overflow="hidden"
        >
            <Box hideBelow="md" aria-hidden="true">
                <Box h="11" bg="bg.subtle" />
                {tableRows.map((row) => (
                    <Grid
                        key={row}
                        data-skeleton-row
                        templateColumns={`repeat(${String(columns)}, minmax(0, 1fr))`}
                        gap="8"
                        alignItems="center"
                        h="13"
                        px="4"
                        borderTopWidth="1px"
                        borderColor="border"
                    >
                        {cells.map((cell) => (
                            <Skeleton key={cell} h="3" />
                        ))}
                    </Grid>
                ))}
            </Box>

            <Stack hideFrom="md" aria-hidden="true" gap="2">
                {cards.map((card) => (
                    <Stack
                        key={card}
                        gap="3.5"
                        p="4"
                        bg="bg"
                        borderWidth="1px"
                        borderColor="border"
                        borderRadius="lg"
                    >
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
                borderColor="border"
                textStyle={{ base: 'sm', md: 'md' }}
                color="fg.muted"
            >
                {label}
            </Text>
        </Box>
    )
}
