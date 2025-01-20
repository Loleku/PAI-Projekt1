import { useState } from "react";

export const useWeatherData = () => {
  const [weatherData, setWeatherData] = useState<any>(null);
  const [loading, setLoading] = useState<boolean>(false);
  const [error, setError] = useState<string | null>(null);

  // Pobiera nazwę miasta na podstawie współrzędnych za pomocą API OpenWeatherMap
  const fetchCityNameByCoords = async (latitude: string, longitude: string, apiKey: string) => {
    try {
      const geoResponse = await fetch(
        `https://api.openweathermap.org/geo/1.0/reverse?lat=${latitude}&lon=${longitude}&limit=1&appid=${apiKey}`
      );
      if (!geoResponse.ok) throw new Error("Nie udało się pobrać nazwy miasta");
      const geoData = await geoResponse.json();

      if (Array.isArray(geoData) && geoData.length > 0) {
        return { name: geoData[0].name, country: geoData[0].country || "Nieznane" };
      } else {
        console.warn("Nie znaleziono danych miasta dla podanych współrzędnych:", { latitude, longitude });
        return null;
      }
    } catch (err) {
      console.error("Błąd podczas pobierania nazwy miasta:", err);
      return null;
    }
  };

  // Pobiera dane pogodowe na podstawie współrzędnych za pomocą API OpenWeatherMap
  const fetchWeatherByCoords = async (latitude: string, longitude: string, apiKey: string) => {
    try {
      setLoading(true);
      setWeatherData(null);
      setError(null);

      const weatherResponse = await fetch(
        `https://api.openweathermap.org/data/3.0/onecall?lat=${latitude}&lon=${longitude}&units=metric&appid=${apiKey}`
      );
      if (!weatherResponse.ok) throw new Error("Nie udało się pobrać danych pogodowych");

      const data = await weatherResponse.json();

      const cityInfo = await fetchCityNameByCoords(latitude, longitude, apiKey);

      setWeatherData({
        ...data,
        cityInfo: cityInfo || { name: "Nieznane", country: "Nieznane" },
        lat: latitude,
        lon: longitude,
      });
    } catch (err) {
      console.error("Błąd podczas pobierania danych pogodowych:", err);
      setError("Nie udało się pobrać danych pogodowych. Spróbuj ponownie.");
    } finally {
      setLoading(false);
    }
  };

  // Pobiera współrzędne miasta na podstawie nazwy miasta za pomocą API OpenWeatherMap
  const fetchCityCoords = async (city: string, countryCode: string, apiKey: string) => {
    try {
      setLoading(true);
      setWeatherData(null);
      setError(null);

      const geoResponse = await fetch(
        `https://api.openweathermap.org/geo/1.0/direct?q=${city}${countryCode ? `,${countryCode}` : ""}&limit=1&appid=${apiKey}`
      );
      if (!geoResponse.ok) throw new Error("Nie udało się pobrać współrzędnych miasta");

      const geoData = await geoResponse.json();

      if (Array.isArray(geoData) && geoData.length > 0) {
        const { lat, lon, name, country } = geoData[0];
        await fetchWeatherByCoords(String(lat), String(lon), apiKey);
        setWeatherData((prevData: any) => ({
          ...prevData,
          cityInfo: { name, country: country || "Nieznane", coord: { lat, lon } },
        }));
      } else {
        setError("Brak wyników dla podanego miasta.");
        setLoading(false);
      }
    } catch (err) {
      console.error("Błąd podczas pobierania współrzędnych miasta:", err);
      setError("Błąd podczas pobierania współrzędnych miasta. Spróbuj ponownie.");
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
