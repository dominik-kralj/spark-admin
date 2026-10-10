import { useStrings } from '@/shared/i18n/useStrings'
import { ErrorState } from '@/shared/ui/ErrorState'

import { useCitySettings } from '../api/useCitySettings'

import { CitySettingsForm } from './CitySettingsForm'
import { CitySettingsLoading } from './CitySettingsLoading'

export function CitySettingsContent() {
    const t = useStrings()
    const settings = useCitySettings()

    // Data first: a failed background refetch keeps the form and what the person typed.
    if (settings.data !== undefined) return <CitySettingsForm settings={settings.data} />

    if (settings.isError) {
        return (
            <ErrorState
                title={t.citySettings.errorTitle}
                error={settings.error}
                onRetry={() => void settings.refetch()}
                isRetrying={settings.isFetching}
            />
        )
    }

    return <CitySettingsLoading />
}
