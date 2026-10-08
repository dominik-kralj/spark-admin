import { Field, Input, InputGroup } from '@chakra-ui/react'
import { Search } from 'lucide-react'
import type { Ref } from 'react'

import { useStrings } from '@/shared/i18n/useStrings'
import { normalisePlate } from '@/shared/lib/validation'

interface PlateSearchProps {
    defaultValue: string
    onSearch: (plateSearch: string) => void
    ref: Ref<HTMLInputElement>
}

// Uncontrolled: the URL applies each keystroke after a tick, too late to drive the input.
export function PlateSearch({ defaultValue, onSearch, ref }: PlateSearchProps) {
    const t = useStrings()

    return (
        <Field.Root role="search" flex="1" minW="0" maxW={{ md: '80' }}>
            <Field.Label>{t.privilegedOwners.search.label}</Field.Label>
            <InputGroup startElement={<Search size="16" aria-hidden="true" />}>
                <Input
                    ref={ref}
                    type="search"
                    autoComplete="off"
                    placeholder={t.privilegedOwners.search.placeholder}
                    defaultValue={defaultValue}
                    onChange={(event) => {
                        onSearch(event.target.value)
                    }}
                    onBlur={(event) => {
                        event.target.value = normalisePlate(event.target.value)
                        onSearch(event.target.value)
                    }}
                />
            </InputGroup>
        </Field.Root>
    )
}
