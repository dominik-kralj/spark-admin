import { Button, Flex, Heading, Stack, Text } from '@chakra-ui/react'
import { TriangleAlert } from 'lucide-react'
import { Link } from 'react-router'

import { useStrings } from '@/shared/i18n/useStrings'
import { focusOnMount } from '@/shared/lib/focusOnMount'
import { paths } from '@/shared/paths'

function ErrorMessage() {
    const t = useStrings()

    return (
        <Stack align="center" gap="2" maxW="420px" textAlign="center">
            <title>{t.app.documentTitle(t.errorPage.title)}</title>

            <TriangleAlert size="28" aria-hidden="true" />
            <Heading
                ref={focusOnMount}
                tabIndex={-1}
                as="h1"
                mt="2"
                fontSize="lg"
                color="spark.heading"
            >
                {t.errorPage.title}
            </Heading>
            <Text color="fg.muted">{t.errorPage.description}</Text>
            <Flex wrap="wrap" justify="center" gap="3" mt="3">
                <Button
                    colorPalette="blue"
                    onClick={() => {
                        window.location.reload()
                    }}
                >
                    {t.errorPage.reload}
                </Button>
                <Button asChild variant="outline">
                    <Link to={paths.home}>{t.errorPage.home}</Link>
                </Button>
            </Flex>
        </Stack>
    )
}

/** A crash inside a section: the shell and its navigation stay. */
export function SectionErrorPage() {
    return (
        <Flex flex="1" align="center" justify="center" p="6">
            <ErrorMessage />
        </Flex>
    )
}

/** A crash outside the shell: login, the layout, or a page that failed to load. */
export function AppErrorPage() {
    return (
        <Flex as="main" minH="100dvh" align="center" justify="center" p="6" bg="bg">
            <ErrorMessage />
        </Flex>
    )
}
