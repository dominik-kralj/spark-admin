import { Flex, Stack, Switch, Text } from '@chakra-ui/react'
import { useId } from 'react'

import { useStrings } from '@/shared/i18n/useStrings'

interface ActiveSwitchProps {
    isActive: boolean
    onChange: (isActive: boolean) => void
}

export function ActiveSwitch({ isActive, onChange }: ActiveSwitchProps) {
    const t = useStrings()
    const helpId = useId()

    return (
        <Switch.Root
            checked={isActive}
            onCheckedChange={({ checked }) => {
                onChange(checked)
            }}
            colorPalette="blue"
            size="lg"
            display="flex"
            justifyContent="space-between"
            gap="4"
            layerStyle="panel"
            p="4"
        >
            <Stack gap="1">
                <Switch.Label fontWeight="medium">{t.inspectors.form.labels.isActive}</Switch.Label>
                <Text id={helpId} fontSize="caption" color="fg.muted">
                    {t.inspectors.form.activeHelp}
                </Text>
            </Stack>

            <Flex align="center" gap="3">
                {/* The switch announces its own state; the word is for sighted users. */}
                <Text aria-hidden="true" fontWeight="medium">
                    {isActive ? t.inspectors.form.yes : t.inspectors.form.no}
                </Text>
                {/* Chakra's input is a plain checkbox; the role makes it read as a switch. */}
                <Switch.HiddenInput role="switch" aria-describedby={helpId} />
                <Switch.Control />
            </Flex>
        </Switch.Root>
    )
}
