// Copied from docs/design/theme/theme.ts (Chakra v3, checked against 3.37). The design
// export is the source: when it changes, copy it again. Its `statusChip` map is left
// out because it keys on raw API status names and holds UI strings; status chips
// get built in src/ with labels from src/i18n/hr.ts.
import { createSystem, defaultConfig, defineConfig } from '@chakra-ui/react'

const config = defineConfig({
    globalCss: {
        'html, body': {
            bg: 'bg.subtle',
            color: 'fg',
            fontFamily: 'body',
        },
        // One focus style everywhere: 2 px blue.700 ring, 2 px offset (5.75:1 on white).
        '*:focus-visible': {
            outline: '2px solid',
            outlineColor: 'spark.blue.700',
            outlineOffset: '2px',
        },
        // Respect the reduced-motion setting everywhere.
        '*, *::before, *::after': {
            _motionReduce: {
                animationDuration: '0.01ms !important',
                transitionDuration: '0.01ms !important',
            },
        },
    },
    theme: {
        tokens: {
            colors: {
                spark: {
                    navy: { 900: { value: '#03112D' } },
                    blue: {
                        50: { value: '#E8F1FB' },
                        500: { value: '#2196F3' }, // logo accent only, 3.12:1 on white
                        700: { value: '#1565C0' },
                        800: { value: '#0D47A1' },
                    },
                    gray: {
                        50: { value: '#F6F7F9' },
                        100: { value: '#EEF1F4' },
                        200: { value: '#E1E5EA' },
                        500: { value: '#6E7887' },
                        600: { value: '#56606E' },
                        700: { value: '#3D4755' },
                        900: { value: '#18202B' },
                    },
                    green: {
                        50: { value: '#E7F4EC' },
                        700: { value: '#1B6B3A' },
                        800: { value: '#14532D' },
                    },
                    red: {
                        50: { value: '#FDECEA' },
                        700: { value: '#B42318' },
                        800: { value: '#8E1B16' },
                    },
                },
            },
            fonts: {
                heading: { value: "'IBM Plex Sans', system-ui, sans-serif" },
                body: { value: "'IBM Plex Sans', system-ui, sans-serif" },
                mono: { value: "'IBM Plex Mono', ui-monospace, monospace" },
            },
            fontSizes: {
                // 13 px: table headers, help text, chips. The smallest size in the design.
                caption: { value: '0.8125rem' },
            },
        },
        semanticTokens: {
            colors: {
                bg: {
                    DEFAULT: { value: '{colors.white}' }, // cards, tables, inputs, drawers
                    subtle: { value: '{colors.spark.gray.50}' }, // page background, table header
                    muted: { value: '{colors.spark.gray.100}' }, // read-only fields, segmented control
                    emphasized: { value: '{colors.spark.gray.200}' },
                    panel: { value: '{colors.white}' },
                    error: { value: '{colors.spark.red.50}' },
                    success: { value: '{colors.spark.green.50}' },
                    info: { value: '{colors.spark.blue.50}' },
                },
                fg: {
                    DEFAULT: { value: '{colors.spark.gray.900}' }, // body text, 16.40:1
                    muted: { value: '{colors.spark.gray.600}' }, // help text, 6.38:1
                    subtle: { value: '{colors.spark.gray.600}' }, // Chakra's default here fails 4.5:1
                    error: { value: '{colors.spark.red.700}' },
                    success: { value: '{colors.spark.green.700}' },
                    info: { value: '{colors.spark.blue.700}' },
                },
                border: {
                    DEFAULT: { value: '{colors.spark.gray.200}' }, // dividers, card outlines (decorative)
                    muted: { value: '{colors.spark.gray.200}' },
                    emphasized: { value: '{colors.spark.gray.500}' }, // input and button borders, 4.47:1
                    error: { value: '{colors.spark.red.700}' },
                    success: { value: '{colors.spark.green.700}' },
                    info: { value: '{colors.spark.blue.700}' },
                },
                // Palettes used through colorPalette="blue" | "red" | "green" | "gray".
                blue: {
                    solid: { value: '{colors.spark.blue.700}' }, // primary button
                    contrast: { value: '{colors.white}' },
                    fg: { value: '{colors.spark.blue.800}' }, // text on blue.subtle, 7.57:1
                    subtle: { value: '{colors.spark.blue.50}' },
                    muted: { value: '{colors.spark.blue.50}' },
                    emphasized: { value: '{colors.spark.blue.800}' }, // hover
                    focusRing: { value: '{colors.spark.blue.700}' },
                },
                red: {
                    solid: { value: '{colors.spark.red.700}' }, // destructive button
                    contrast: { value: '{colors.white}' },
                    fg: { value: '{colors.spark.red.800}' }, // text on red.subtle, 7.92:1
                    subtle: { value: '{colors.spark.red.50}' },
                    muted: { value: '{colors.spark.red.50}' },
                    emphasized: { value: '{colors.spark.red.800}' },
                    focusRing: { value: '{colors.spark.blue.700}' },
                },
                green: {
                    solid: { value: '{colors.spark.green.700}' },
                    contrast: { value: '{colors.white}' },
                    fg: { value: '{colors.spark.green.800}' }, // text on green.subtle, 8.05:1
                    subtle: { value: '{colors.spark.green.50}' },
                    muted: { value: '{colors.spark.green.50}' },
                    emphasized: { value: '{colors.spark.green.800}' },
                    focusRing: { value: '{colors.spark.blue.700}' },
                },
                gray: {
                    solid: { value: '{colors.spark.navy.900}' }, // current page button, filter count
                    contrast: { value: '{colors.white}' },
                    fg: { value: '{colors.spark.gray.700}' }, // text on gray.subtle, 8.30:1
                    subtle: { value: '{colors.spark.gray.100}' },
                    muted: { value: '{colors.spark.gray.200}' },
                    emphasized: { value: '{colors.spark.gray.200}' },
                    focusRing: { value: '{colors.spark.blue.700}' },
                },
                // Roles that have no Chakra equivalent.
                spark: {
                    heading: { value: '{colors.spark.navy.900}' },
                    link: { value: '{colors.spark.blue.700}' },
                    linkHover: { value: '{colors.spark.blue.800}' },
                    scrim: { value: 'rgba(3, 17, 45, 0.45)' },
                },
            },
        },
    },
})

export const system = createSystem(defaultConfig, config)
