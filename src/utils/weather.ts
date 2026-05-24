import type { WeatherSnapshot } from '../types';

function getPosition(timeoutMs = 8000): Promise<GeolocationPosition> {
  return new Promise((resolve, reject) => {
    if (!('geolocation' in navigator)) {
      reject(new Error('Geolocation API not supported'));
      return;
    }
    navigator.geolocation.getCurrentPosition(resolve, reject, {
      enableHighAccuracy: false,
      timeout: timeoutMs,
      maximumAge: 5 * 60 * 1000,
    });
  });
}

export async function fetchWeather(): Promise<WeatherSnapshot> {
  const now = Date.now();
  try {
    const pos = await getPosition();
    const lat = pos.coords.latitude;
    const lon = pos.coords.longitude;
    const url =
      `https://api.open-meteo.com/v1/forecast?latitude=${lat.toFixed(4)}` +
      `&longitude=${lon.toFixed(4)}` +
      `&current=temperature_2m,relative_humidity_2m,wind_speed_10m,wind_direction_10m` +
      `&wind_speed_unit=ms&timezone=auto`;
    const res = await fetch(url);
    if (!res.ok) throw new Error(`weather api ${res.status}`);
    const j = (await res.json()) as {
      current?: {
        temperature_2m?: number;
        relative_humidity_2m?: number;
        wind_speed_10m?: number;
        wind_direction_10m?: number;
      };
    };
    const c = j.current ?? {};
    return {
      temperatureC: c.temperature_2m ?? null,
      humidity: c.relative_humidity_2m ?? null,
      windDirectionDeg: c.wind_direction_10m ?? null,
      windSpeedMs: c.wind_speed_10m ?? null,
      fetchedAt: now,
      lat,
      lon,
    };
  } catch (e) {
    return {
      temperatureC: null,
      humidity: null,
      windDirectionDeg: null,
      windSpeedMs: null,
      fetchedAt: now,
      error: e instanceof Error ? e.message : String(e),
    };
  }
}

export function windDirectionLabel(deg: number | null): string {
  if (deg === null) return '-';
  const labels = ['北', '北東', '東', '南東', '南', '南西', '西', '北西'];
  const idx = Math.round(((deg % 360) / 45)) % 8;
  return labels[idx];
}
