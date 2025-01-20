import { useState, useEffect } from "react";
import { useFavouritesStore } from "../stores/favouritesStore";
import { WeatherIcon } from "weather-react-icons";
import { useNavigate } from "react-router-dom";
import { AiOutlineClose, AiOutlineArrowRight } from "react-icons/ai";
import "weather-react-icons/lib/css/weather-icons.css";
import { useWeatherData } from "../utils/weatherApiService";

export const getWeatherIcon = (id: number, iconCode: string, size: string = "normal") => {
  const isNight = iconCode.endsWith("n");
  const className = size === "large" ? "text-3xl" : "text-xl";
  return <WeatherIcon iconId={id} name="owm" night={isNight} className={className} />;
};

export const FavouritesPage = () => {
  const { favourites, removeFavourite } = useFavouritesStore();
  const { weatherData, fetchCityCoords, loading, error } = useWeatherData();
  const [localWeatherData, setLocalWeatherData] = useState<any>({});
  const navigate = useNavigate();

  useEffect(() => {
    favourites.forEach((city) => {
      if (!localWeatherData[city]) {
        fetchCityCoords(city, "", "021ac140547cb2baca46321809c85ffa");
      }
    });
  }, [favourites]);

  useEffect(() => {
    if (weatherData?.cityInfo?.name) {
      setLocalWeatherData((prev: any) => ({ ...prev, [weatherData.cityInfo.name]: weatherData }));
    }
  }, [weatherData]);

  const adjustTimeForTimezone = (timestamp: number, timezoneOffset: number) => {
    return new Date((timestamp + timezoneOffset) * 1000).toLocaleTimeString([], {
      hour: "2-digit",
      minute: "2-digit",
    });
  };

  return (
    <div className="flex flex-col items-center justify-start min-h-screen p-4 bg-slate-800 text-white">
      <h1 className="text-4xl font-bold mt-20 mb-4">Favorite Locations</h1>
      {favourites.length === 0 ? (
        <p className="text-lg text-gray-400">No favorite locations. Add new ones from the weather page!</p>
      ) : (
        <ul className="w-full max-w-4xl space-y-4">
          {favourites.map((city) => {
            const data = localWeatherData[city];
            const isNight = data?.current.weather[0]?.icon.endsWith("n");

            return (
              <li
                key={city}
                className={`p-6 rounded-xl shadow-lg flex justify-between items-start ${isNight ? 'bg-gradient-to-r from-gray-900 via-gray-800 to-gray-700' : 'bg-gradient-to-r from-blue-500 via-blue-700 to-blue-900'}`}
              >
                {data ? (
                  <>
                    <div className="w-full flex items-center gap-6">
                      <div>
                        <p className="text-3xl font-bold mb-4">
                          {city} ({data.cityInfo.country || "Unknown"})
                        </p>
                        <div className="flex items-center gap-3">
                          <p className="text-4xl font-bold">
                            {Math.floor(data.current.temp)}°C
                          </p>
                          {getWeatherIcon(
                            data.current.weather[0]?.id,
                            data.current.weather[0]?.icon,
                            "large"
                          )}
                        </div>
                        <p className="text-lg">
                          Feels like: {Math.floor(data.current.feels_like)}°C
                        </p>
                        <p className="text-lg capitalize">
                          {data.current.weather[0]?.description}
                        </p>
                      </div>
                      <div className="grid grid-cols-2 gap-4 text-lg">
                        <div>
                          <p>Humidity: {data.current.humidity}%</p>
                          <p>UV Index: {data.current.uvi}</p>
                          <p>Visibility: {data.current.visibility / 1000} km</p>
                          <p>Wind Speed: {data.current.wind_speed} m/s</p>
                          <p>Pressure: {data.current.pressure} hPa</p>
                        </div>
                        <div className="flex flex-col justify-center items-center">
                        <p className={`font-bold text-yellow-400`}>
                          Sunrise: {adjustTimeForTimezone(data.current.sunrise, data.timezone_offset)}
                        </p>
                        <p className={`font-bold text-yellow-400`}>
                          Sunset: {adjustTimeForTimezone(data.current.sunset, data.timezone_offset)}
                        </p>
                        </div>
                      </div>
                    </div>
                    <div className="flex space-x-4">
                      <button
                        onClick={() => removeFavourite(city)}
                        className="p-3 text-white hover:text-gray-400 transition-colors"
                      >
                        <AiOutlineClose size={20} />
                      </button>
                      <button
                        onClick={() => navigate(`/weather/${city}`)}
                        className="p-3 text-white hover:text-gray-400 transition-colors"
                      >
                        <AiOutlineArrowRight size={20} />
                      </button>
                    </div>
                  </>
                ) : loading ? (
                  <p>Loading weather data for {city}...</p>
                ) : (
                  <p className="text-red-500">{error}</p>
                )}
              </li>
            );
          })}
        </ul>
      )}
    </div>
  );
};
