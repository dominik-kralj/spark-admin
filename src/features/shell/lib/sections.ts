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

import { hr } from '@/shared/i18n/hr'
import { paths } from '@/shared/paths'

export interface Section {
    path: string
    label: string
    icon: LucideIcon
}

export const sections: Section[] = [
    { path: paths.tickets, label: hr.nav.tickets, icon: Ticket },
    { path: paths.dailyTickets, label: hr.nav.dailyTickets, icon: ClipboardList },
    { path: paths.zones, label: hr.nav.zones, icon: MapPin },
    { path: paths.privilegedOwners, label: hr.nav.privilegedOwners, icon: ShieldCheck },
    { path: paths.inspectors, label: hr.nav.inspectors, icon: UserCheck },
    { path: paths.reports, label: hr.nav.reports, icon: FileText },
    { path: paths.citySettings, label: hr.nav.citySettings, icon: Landmark },
    { path: paths.adminUsers, label: hr.nav.adminUsers, icon: Users },
]
