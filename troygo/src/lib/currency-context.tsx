'use client'

import { createContext, useContext, useState, useEffect, ReactNode } from 'react'

interface ExchangeRates {
  base: string
  rates: Record<string, number>
  timestamp: number
}

interface CurrencyContextType {
  currency: string
  rates: Record<string, number> | null
  setCurrency: (code: string) => void
  convertPrice: (usdAmount: number) => number
  formatPrice: (usdAmount: number, showCode?: boolean) => string
}

const CurrencyContext = createContext<CurrencyContextType | undefined>(undefined)

export function CurrencyProvider({ children }: { children: ReactNode }) {
  const [currency, setCurrency] = useState('USD')
  const [rates, setRates] = useState<Record<string, number> | null>(null)
  const [loading, setLoading] = useState(true)

  // Fetch exchange rates on mount
  useEffect(() => {
    async function fetchRates() {
      try {
        const response = await fetch('/api/exchange-rates')
        const data: ExchangeRates = await response.json()
        setRates(data.rates)
      } catch (error) {
        console.error('Failed to fetch exchange rates:', error)
        // Fallback rates if API fails
        setRates({
          USD: 1,
          EUR: 0.92,
          GBP: 0.79,
          JPY: 149.5,
          CAD: 1.36,
          AUD: 1.53,
          AED: 3.67,
        })
      } finally {
        setLoading(false)
      }
    }
    fetchRates()
  }, [])

  const convertPrice = (usdAmount: number): number => {
    if (!rates || !rates[currency]) return usdAmount
    return usdAmount * rates[currency]
  }

  const formatPrice = (usdAmount: number, showCode = false): string => {
    const converted = convertPrice(usdAmount)
    const symbols: Record<string, string> = {
      USD: '$',
      EUR: '€',
      GBP: '£',
      JPY: '¥',
      CAD: 'C$',
      AUD: 'A$',
      AED: 'د.إ',
    }

    const symbol = symbols[currency] || '$'
    const formatted =
      currency === 'JPY'
        ? converted.toLocaleString('en-US', { maximumFractionDigits: 0 })
        : converted.toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })

    return showCode ? `${symbol}${formatted} ${currency}` : `${symbol}${formatted}`
  }

  return (
    <CurrencyContext.Provider value={{ currency, rates, setCurrency, convertPrice, formatPrice }}>
      {children}
    </CurrencyContext.Provider>
  )
}

export function useCurrency() {
  const context = useContext(CurrencyContext)
  if (!context) {
    throw new Error('useCurrency must be used within CurrencyProvider')
  }
  return context
}
