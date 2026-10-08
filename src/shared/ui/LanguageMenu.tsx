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
    variant: 'header' | 'drawerRow'
}

export function LanguageMenu({ variant }: LanguageMenuProps) {
    const language = useLanguage()
    const isDrawerRow = variant === 'drawerRow'
    const currentLabel = isDrawerRow ? languageNames[language] : language.toUpperCase()

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
                    variant="outline"
                    size={isDrawerRow ? 'xl' : 'sm'}
                    w={isDrawerRow ? 'full' : undefined}
                    aria-label={`${languagePickerLabel}: ${currentLabel}`}
                >
                    <Globe aria-hidden="true" />
                    {currentLabel}
                </Button>
            </Menu.Trigger>

            {/* In the drawer, a portal would put the menu outside its focus trap. */}
            {isDrawerRow ? menu : <Portal>{menu}</Portal>}
        </Menu.Root>
    )
}
