import { Center, Stack } from '@chakra-ui/react'

import { useStrings } from '@/shared/i18n/useStrings'
import { PageHeader } from '@/shared/ui/PageHeader'

import type { Section } from '../lib/sections'

export function PlaceholderPage({ labelKey }: { labelKey: Section['labelKey'] }) {
    const t = useStrings()

    return (
        <Stack gap="4" flex="1">
            <PageHeader title={t.nav[labelKey]} />

            <Center
                flex="1"
                minH="320px"
                borderWidth="1px"
                borderStyle="dashed"
                borderColor="border.emphasized"
                borderRadius="l3"
                color="fg.muted"
            >
                {t.shell.placeholder}
            </Center>
        </Stack>
    )
}
