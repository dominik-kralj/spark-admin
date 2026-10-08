import {
    ClipboardList,
    FileText,
    Landmark,
    MapPin,
    ShieldCheck,
    Ticket,
    UserCheck,
    Users,
    type LucideIcon,
} from 'lucide-react'

import type { Dictionary } from '@/shared/i18n/dictionary'
import { paths } from '@/shared/paths'

export interface Section {
    path: string
    /** Resolved against the active dictionary at render, so it follows the language. */
    labelKey: keyof Dictionary['nav']
    icon: LucideIcon
}

export const sections: Section[] = [
    { path: paths.tickets, labelKey: 'tickets', icon: Ticket },
    { path: paths.dailyTickets, labelKey: 'dailyTickets', icon: ClipboardList },
    { path: paths.zones, labelKey: 'zones', icon: MapPin },
    { path: paths.privilegedOwners, labelKey: 'privilegedOwners', icon: ShieldCheck },
    { path: paths.inspectors, labelKey: 'inspectors', icon: UserCheck },
    { path: paths.reports, labelKey: 'reports', icon: FileText },
    { path: paths.citySettings, labelKey: 'citySettings', icon: Landmark },
    { path: paths.adminUsers, labelKey: 'adminUsers', icon: Users },
]
