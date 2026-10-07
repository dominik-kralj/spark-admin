const pluralRules = new Intl.PluralRules('hr')

interface PluralForms {
    one: string
    few: string
    other: string
}

export function plural(count: number, forms: PluralForms): string {
    const category = pluralRules.select(count)

    return category === 'one' || category === 'few' ? forms[category] : forms.other
}
