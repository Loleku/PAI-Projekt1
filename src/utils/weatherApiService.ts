import { useState } from "react";

export const useWeatherData = () => {
  const [weatherData, setWeatherData] = useState<any>(null);
  const [loading, setLoading] = useState<boolean>(false);
  const [error, setError] = useState<string | null>(null);

  const fetchCityNameByCoords = async (latitude: string, longitude: string, apiKey: string) => {
    try {
      const geoResponse = await fetch(
        `https://api.openweathermap.org/geo/1.0/reverse?lat=${latitude}&lon=${longitude}&limit=1&appid=${apiKey}`
      );
      if (!geoResponse.ok) throw new Error("Failed to fetch city name");
      const geoData = await geoResponse.json();
      if (Array.isArray(geoData) && geoData.length > 0) {
        return { name: geoData[0].name, country: geoData[0].country || "Unknown" };
      } else {
        return null;
      }
    } catch {
      return null;
    }
  };

  const fetchWeatherByCoords = async (latitude: string, longitude: string, apiKey: string) => {
    try {
      setLoading(true);
      setWeatherData(null);
      setError(null);
      const weatherResponse = await fetch(
        `https://api.openweathermap.org/data/3.0/onecall?lat=${latitude}&lon=${longitude}&units=metric&appid=${apiKey}`
      );
      if (!weatherResponse.ok) throw new Error("Failed to fetch weather data");
      const data = await weatherResponse.json();
      const cityInfo = await fetchCityNameByCoords(latitude, longitude, apiKey);
      setWeatherData({ ...data, cityInfo });
    } catch {
      setError("Failed to fetch weather data. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  const fetchCityCoords = async (city: string, countryCode: string, apiKey: string) => {
    try {
      setLoading(true);
      setWeatherData(null);
      setError(null);
      const geoResponse = await fetch(
        `https://api.openweathermap.org/geo/1.0/direct?q=${city}${countryCode ? `,${countryCode}` : ""}&limit=1&appid=${apiKey}`
      );
      if (!geoResponse.ok) throw new Error("Failed to fetch city coordinates");
      const geoData = await geoResponse.json();
      if (Array.isArray(geoData) && geoData.length > 0) {
        const { lat, lon } = geoData[0];
        fetchWeatherByCoords(String(lat), String(lon), apiKey);
      } else {
        setError("No results found for the given city.");
        setLoading(false);
      }
    } catch {
      setError("Error fetching city coordinates. Please try again.");
      setLoading(false);
    }
  };

  return {
    weatherData,
    loading,
    error,
    fetchWeatherByCoords,
    fetchCityCoords,
  };
};
