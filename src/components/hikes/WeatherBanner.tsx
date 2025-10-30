import React, { useEffect, useState } from 'react'
import { DropletsIcon, WindIcon, MapPin, Calendar } from 'lucide-react'

interface WeatherData {
  temp: number
  description: string
  icon: string
  humidity: number
  windSpeed: number
}

interface Props {
  city: string
}

export default function WeatherBanner({ city }: Props) {
  const [weather, setWeather] = useState<WeatherData | null>(null)
  const [error, setError] = useState<string | null>(null)
  const [loading, setLoading] = useState(true)

  // Format date
  const today = new Date()
  const formattedDate = today.toLocaleDateString('fr-FR', {
    weekday: 'long',
    day: 'numeric',
    month: 'long'
  })

  useEffect(() => {
    const API_KEY = import.meta.env.VITE_WEATHER_API_KEY
    if (!API_KEY) {
      setError('Clé API manquante')
      setLoading(false)
      return
    }

    fetch(
      `https://api.openweathermap.org/data/2.5/weather?q=${city}&appid=${API_KEY}&units=metric&lang=fr`
    )
      .then(res => {
        if (!res.ok) throw new Error(`Erreur ${res.status}`)
        return res.json()
      })
      .then(data => {
        setWeather({
          temp: data.main.temp,
          description: data.weather[0].description,
          icon: `https://openweathermap.org/img/wn/${data.weather[0].icon}@2x.png`,
          humidity: data.main.humidity,
          windSpeed: data.wind.speed,
        })
        setLoading(false)
      })
      .catch(err => {
        console.error(err)
        setError('Impossible de charger la météo')
        setLoading(false)
      })
  }, [city])

  if (loading) {
    return (
      <div className="bg-[var(--dark)] border border-[var(--green-moss)] border-opacity-30 rounded-xl p-5">
        <div className="animate-pulse flex items-center gap-6">
          <div className="w-16 h-16 bg-[var(--green-moss)] bg-opacity-20 rounded-lg"></div>
          <div className="flex-1">
            <div className="h-4 bg-[var(--green-moss)] bg-opacity-20 rounded w-32 mb-2"></div>
            <div className="h-6 bg-[var(--green-moss)] bg-opacity-20 rounded w-20 mb-2"></div>
            <div className="h-3 bg-[var(--green-moss)] bg-opacity-20 rounded w-40"></div>
          </div>
        </div>
      </div>
    )
  }

  if (error) {
    return (
      <div className="bg-[var(--dark)] border border-[var(--orange)] rounded-xl p-5">
        <div className="flex items-center gap-3 text-[var(--orange)]">
          <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
          </svg>
          <p className="text-[var(--white)] text-sm">{error}</p>
        </div>
      </div>
    )
  }

  if (!weather) return null

  return (
    <div className="bg-[var(--dark)] border border-[var(--green-moss)] border-opacity-30 rounded-xl p-5 shadow-md transition-all duration-300 hover:shadow-lg hover:border-opacity-50">
      <div className="flex flex-col md:flex-row md:items-center gap-5">

        {/* Left: Weather Icon & Temperature */}
        <div className="flex items-center gap-4">
          <div className="w-20 h-20 bg-[var(--green-moss)] bg-opacity-20 rounded-xl flex items-center justify-center flex-shrink-0">
            <img
              src={weather.icon}
              alt={weather.description}
              className="w-16 h-16"
            />
          </div>

          <div>
            <div className="flex items-baseline gap-1">
              <span
                className="text-5xl text-[var(--white)] font-bold leading-none"
                style={{ fontFamily: 'NoeDisplay' }}
              >
                {Math.round(weather.temp)}
              </span>
              <span className="text-2xl text-[var(--lavander)]">°C</span>
            </div>
            <p className="text-[var(--lavander)] text-sm capitalize mt-1">
              {weather.description}
            </p>
          </div>
        </div>

        {/* Center: Location & Date */}
        <div className="flex-1 space-y-2 md:border-l md:border-[var(--green-moss)] md:border-opacity-30 md:pl-5">
          <div className="flex items-center gap-2">
            <MapPin className="w-4 h-4 text-[var(--white)] flex-shrink-0" />
            <span
              className="text-[var(--white)] text-lg font-semibold"
              style={{ fontFamily: 'NoeDisplay' }}
            >
              {city}
            </span>
          </div>

          <div className="flex items-center gap-2">
            <Calendar className="w-4 h-4 text-[var(--lavander)] flex-shrink-0" />
            <span className="text-[var(--lavander)] text-sm capitalize">
              {formattedDate}
            </span>
          </div>
        </div>

        {/* Right: Weather Details */}
        <div className="flex md:flex-col gap-6 md:gap-3 md:border-l md:border-[var(--green-moss)] md:border-opacity-30 md:pl-5">
          <div className="flex items-center gap-3">
            <div className="w-9 h-9 bg-[var(--corail)] bg-opacity-20 rounded-lg flex items-center justify-center flex-shrink-0">
              <DropletsIcon className="w-5 h-5 text-[var(--white)]" />
            </div>
            <div>
              <p className="text-[var(--lavander)] text-xs">Humidité</p>
              <p className="text-[var(--white)] font-semibold">{weather.humidity}%</p>
            </div>
          </div>

          <div className="flex items-center gap-3">
            <div className="w-9 h-9 bg-[var(--corail)] bg-opacity-20 rounded-lg flex items-center justify-center flex-shrink-0">
              <WindIcon className="w-5 h-5 text-[var(--white)]" />
            </div>
            <div>
              <p className="text-[var(--lavander)] text-xs">Vent</p>
              <p className="text-[var(--white)] font-semibold">{Math.round(weather.windSpeed * 3.6)} km/h</p>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}
