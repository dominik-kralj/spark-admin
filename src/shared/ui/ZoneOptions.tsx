import type { ZoneOption } from '@/shared/lib/useZoneOptions'

interface ZoneOptionsProps {
    // From the select's owner: the select must re-render when they arrive to show a set value.
    zones: ZoneOption[] | undefined
    allZonesLabel: string
}

/** A zone select's options: every zone (value '') first, then the city's zones by code. */
export function ZoneOptions({ zones, allZonesLabel }: ZoneOptionsProps) {
    return (
        <>
            <option value="">{allZonesLabel}</option>
            {zones?.map((zone) => (
                <option key={zone.id} value={String(zone.id)}>
                    {zone.code}
                </option>
            ))}
        </>
    )
}
