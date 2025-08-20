"use client"

import { ReactNode } from "react"
import { ThemeProvider as NextThemesProvider, ThemeProviderProps } from "next-themes"

interface CustomThemeProviderProps extends ThemeProviderProps {
  children: ReactNode
}

export function ThemeProvider({ children, ...props }: CustomThemeProviderProps) {
  return <NextThemesProvider {...props}>{children}</NextThemesProvider>
}
