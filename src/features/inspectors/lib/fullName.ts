import type { Inspector } from '../validators/inspector'

export function fullName(inspector: Pick<Inspector, 'name' | 'surname'>): string {
    return `${inspector.name} ${inspector.surname}`
}
