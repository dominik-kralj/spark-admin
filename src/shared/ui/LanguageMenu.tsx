import { Button, Menu, Portal } from '@chakra-ui/react'
import { Globe } from 'lucide-react'

import {
    isLanguage,
    languageNames,
    languagePickerLabel,
    languages,
    setLanguage,
} from '@/shared/i18n/language'
import { useLanguage } from '@/shared/i18n/useStrings'

interface LanguageMenuProps {
    /** compact shows the code (login); row shows the name at full width (sidebar, drawers). */
    variant: 'compact' | 'row'
    /** False inside a drawer: a portal would put the menu outside its focus trap. */
    portalled?: boolean
}

export function LanguageMenu({ variant, portalled = true }: LanguageMenuProps) {
    const language = useLanguage()
    const currentLabel = variant === 'compact' ? language.toUpperCase() : languageNames[language]
    const name = `${languagePickerLabel}: ${currentLabel}`

    const menu = (
        <Menu.Positioner>
            <Menu.Content minW="10rem">
                <Menu.RadioItemGroup
                    value={language}
                    onValueChange={({ value }) => {
                        if (isLanguage(value)) setLanguage(value)
                    }}
                >
                    {languages.map((option) => (
                        <Menu.RadioItem key={option} value={option} lang={option}>
                            {languageNames[option]}
                            <Menu.ItemIndicator />
                        </Menu.RadioItem>
                    ))}
                </Menu.RadioItemGroup>
            </Menu.Content>
        </Menu.Positioner>
    )

    return (
        <Menu.Root>
            <Menu.Trigger asChild>
                <Button
                    aria-label={name}
                    variant="outline"
                    size={variant === 'row' ? 'md' : 'sm'}
                    w={variant === 'row' ? 'full' : undefined}
                >
                    <Globe aria-hidden="true" />
                    {currentLabel}
                </Button>
            </Menu.Trigger>

            {portalled ? <Portal>{menu}</Portal> : menu}
        </Menu.Root>
    )
}
