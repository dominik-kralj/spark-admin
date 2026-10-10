export function fullName(person: { name: string; surname: string }): string {
    return `${person.name} ${person.surname}`
}
