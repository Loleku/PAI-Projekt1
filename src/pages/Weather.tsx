import { useParams } from "react-router-dom";
import Player from "lottie-react";
import { useForm } from "react-hook-form";
import animationData from "../assets/loading.json";
import { WeatherIcon } from "weather-react-icons";
import "weather-react-icons/lib/css/weather-icons.css";
import { countries } from "../constants/countries";
import { MdMyLocation } from "react-icons/md";
import { AiFillStar } from "react-icons/ai";
import { useFavouritesStore } from "../stores/favouritesStore";
import { useWeatherData } from "../utils/weatherApiService";

type FormData = {
  city: string;
  country: string;
  lat: string;
  lon: string;
  useCoordinates: boolean;
};

export const getWeatherIcon = (id: number, iconCode: string, size: string = "normal") => {
  const isNight = iconCode.endsWith("n");
  const className = size === "large" ? "text-3xl" : "text-xl";
  return <WeatherIcon iconId={id} name="owm" night={isNight} className={className} />;
};

export const WeatherPage = () => {
  const { city } = useParams<{ city: string }>();
  const { weatherData, loading, error, fetchWeatherByCoords, fetchCityCoords } = useWeatherData();

  const { addFavourite, removeFavourite, favourites } = useFavouritesStore();

  const { register, handleSubmit, watch, setValue } = useForm<FormData>({
    defaultValues: {
      city: city || "",
      country: "",
      lat: "",
      lon: "",
      useCoordinates: false,
    },
  });

  const watchUseCoordinates = watch("useCoordinates");

  const handleCheckboxChange = (isChecked: boolean) => {
    setValue("useCoordinates", isChecked);
    if (isChecked) {
      setValue("city", "");
      setValue("country", "");
    } else {
      setValue("lat", "");
      setValue("lon", "");
    }
  };

  const onSubmit = (data: FormData) => {
    if (data.useCoordinates) {
      if (data.lat.trim() && data.lon.trim()) {
        fetchWeatherByCoords(data.lat.trim(), data.lon.trim(), "65815816c390584a0953c5215c32acda");
      } else {
        console.error("Please enter valid coordinates.");
      }
    } else {
      if (data.city.trim()) {
        fetchCityCoords(data.city.trim(), data.country.trim(), "65815816c390584a0953c5215c32acda");
      } else {
        console.error("Please enter a valid city name.");
      }
    }
  };

  const fetchUserLocation = () => {
    if (!navigator.geolocation) {
      console.error("Geolocation is not supported by this browser.");
      return;
    }
    navigator.geolocation.getCurrentPosition(
      (position) => {
        const { latitude, longitude } = position.coords;
        fetchWeatherByCoords(
          String(latitude),
          String(longitude),
          "65815816c390584a0953c5215c32acda"
        );
      },
      () => {
        console.error("Failed to get your location. Please allow location access.");
      }
    );
  };

  const getLocalTime = (timestamp: number, timezoneOffset: number) => {
    const localTime = new Date((timestamp + timezoneOffset) * 1000);
    return localTime;
  };

  const isFavourite = (lat: string, lon: string) => {
    return favourites.some(
      (fav) => fav.lat === String(lat) && fav.lon === String(lon)
    );
  };

  const toggleFavourite = (lat: string, lon: string) => {
    if (!lat || !lon) {
      console.error("Invalid coordinates for toggleFavourite:", { lat, lon });
      return;
    }

    const location = { lat: String(lat), lon: String(lon) };
    if (isFavourite(String(lat), String(lon))) {
      removeFavourite(location);
    } else {
      addFavourite(location);
    }
  };

  const isNight = weatherData?.current?.weather[0]?.icon.endsWith("n");

  return (
    <div className="min-h-screen pt-24 bg-slate-800 text-white flex flex-col items-center">
      <h1 className="text-4xl font-bold mb-4">Weather Finder</h1>
      <form onSubmit={handleSubmit(onSubmit)} className="mb-4 flex flex-col items-center gap-4">
        <label className="flex items-center gap-2">
          <input
            type="checkbox"
            className="w-4 h-4"
            {...register("useCoordinates")}
            onChange={(e) => handleCheckboxChange(e.target.checked)}
          />
          <span>Search by coordinates</span>
        </label>
        <input
          type="text"
          placeholder="Enter city name"
          className="px-4 py-2 rounded bg-slate-700 text-white outline-none w-full max-w-md"
          disabled={watchUseCoordinates}
          {...register("city")}
        />
        <select
          className="px-4 py-2 rounded bg-slate-700 text-white outline-none w-full max-w-md"
          disabled={watchUseCoordinates}
          {...register("country")}
        >
          <option value="">Select Country (Optional)</option>
          {countries.map((country) => (
            <option key={country.code} value={country.code}>
              {country.name} ({country.code})
            </option>
          ))}
        </select>
        <div className="flex gap-2 w-full max-w-md">
          <input
            type="text"
            placeholder="Latitude"
            className="px-4 py-2 rounded bg-slate-700 text-white outline-none w-1/2"
            disabled={!watchUseCoordinates}
            {...register("lat")}
          />
          <input
            type="text"
            placeholder="Longitude"
            className="px-4 py-2 rounded bg-slate-700 text-white outline-none w-1/2"
            disabled={!watchUseCoordinates}
            {...register("lon")}
          />
        </div>
        <div className="flex gap-4 mt-4">
          <button type="submit" className="px-4 py-2 rounded bg-logoYellow text-black font-semibold">
            Search
          </button>
          <button
            type="button"
            onClick={fetchUserLocation}
            className="w-12 h-12 flex items-center justify-center rounded-full bg-blue-500 text-white hover:bg-blue-600 shadow-lg"
          >
            <MdMyLocation size={24} />
          </button>
        </div>
      </form>
      {loading && (
        <div className="w-full max-w-md mt-4 text-center">
          <Player autoplay loop animationData={animationData} className="w-40 h-40 mx-auto" />
          <p className="text-lg mt-2">Loading...</p>
        </div>
      )}
      {error && (
        <div className="w-full max-w-md mt-4 text-center text-red-500">
          <p className="text-lg">{error}</p>
        </div>
      )}
      {weatherData && weatherData.current ? (
        <div className="w-full max-w-4xl">
          <div
            className={`p-6 rounded-xl shadow-lg flex justify-between items-start mb-16 ${
              isNight
                ? "bg-gradient-to-r from-gray-900 via-gray-800 to-gray-700"
                : "bg-gradient-to-r from-blue-500 via-blue-700 to-blue-900"
            }`}
          >
            <div className="w-full flex items-center gap-6">
              <div>
                <p className="text-3xl font-bold mb-4">
                  {weatherData.cityInfo?.name || weatherData.lat + ", " + weatherData.lon} ({
                    weatherData.cityInfo?.country || "Unknown"
                  })
                </p>
                <div className="flex items-center gap-3">
                  <p className="text-4xl font-bold">
                    {Math.floor(weatherData.current.temp)}°C
                  </p>
                  {getWeatherIcon(
                    weatherData.current.weather[0]?.id,
                    weatherData.current.weather[0]?.icon,
                    "large"
                  )}
                </div>
                <p className="text-lg">
                  Feels like: {Math.floor(weatherData.current.feels_like)}°C
                </p>
                <p className="text-lg capitalize">
                  {weatherData.current.weather[0]?.description}
                </p>
              </div>
              <div className="grid grid-cols-2 gap-4 text-lg">
                <div>
                  <p>Humidity: {weatherData.current.humidity}%</p>
                  <p>UV Index: {weatherData.current.uvi}</p>
                  <p>Visibility: {weatherData.current.visibility / 1000} km</p>
                  <p>Wind Speed: {weatherData.current.wind_speed} m/s</p>
                  <p>Pressure: {weatherData.current.pressure} hPa</p>
                </div>
                <div className="flex flex-col justify-center items-center">
                  <p className="font-bold text-yellow-400">
                    Sunrise: {" "}
                    {getLocalTime(weatherData.current.sunrise, weatherData.timezone_offset).toLocaleTimeString(
                      [],
                      { hour: "2-digit", minute: "2-digit" }
                    )}
                  </p>
                  <p className="font-bold text-yellow-400">
                    Sunset: {" "}
                    {getLocalTime(weatherData.current.sunset, weatherData.timezone_offset).toLocaleTimeString(
                      [],
                      { hour: "2-digit", minute: "2-digit" }
                    )}
                  </p>
                  <p className="text-sm text-gray-500">
                    Latitude: {weatherData.lat || weatherData.cityInfo?.coord?.lat}
                  </p>
                  <p className="text-sm text-gray-500">
                    Longitude: {weatherData.lon || weatherData.cityInfo?.coord?.lon}
                  </p>
                </div>
              </div>
            </div>
            <button
              onClick={() =>
                toggleFavourite(
                  String(weatherData.lat || weatherData.cityInfo?.coord?.lat),
                  String(weatherData.lon || weatherData.cityInfo?.coord?.lon)
                )
              }
              className={`w-12 h-12 flex items-center justify-center rounded-full shadow-lg ${
                isFavourite(weatherData.lat || weatherData.cityInfo?.coord?.lat, weatherData.lon || weatherData.cityInfo?.coord?.lon)
                  ? "bg-logoYellow text-white hover:bg-yellow-600 transition-colors"
                  : "bg-gray-400 text-gray-700 hover:bg-gray-500 transition-colors"
              }`}
            >
              <AiFillStar size={24} />
            </button>
          </div>
          <h2 className="text-2xl font-bold mb-4">24-Hour Forecast</h2>
          <div className="overflow-x-auto mb-8">
            <div className="flex gap-4 pb-4">
              {weatherData.hourly.slice(0, 24).map((hour: any, index: number) => (
                <div key={index} className="flex-shrink-0 w-32 p-4 bg-slate-700 rounded-lg shadow-md">
                  <p className="font-semibold">
                    {getLocalTime(hour.dt, weatherData.timezone_offset).toLocaleTimeString('en-US', {
                      hour: '2-digit',
                      minute: '2-digit',
                      hour12: false
                    })}
                  </p>
                  <div className="flex items-center justify-between my-2">
                    <p className="text-xl">{Math.floor(hour.temp)}°C</p>
                    {getWeatherIcon(
                      hour.weather[0]?.id,
                      hour.weather[0]?.icon
                    )}
                  </div>
                  <div className="mt-2 text-sm">
                    <p>Humidity: {hour.humidity}%</p>
                    <p>Wind: {hour.wind_speed} m/s</p>
                  </div>
                </div>
              ))}
            </div>
          </div>
          <h2 className="text-2xl font-bold mb-4">7-Day Forecast</h2>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 mb-12">
            {weatherData.daily.slice(1, 8).map((day: any, index: number) => (
              <div key={index} className="p-4 bg-slate-700 rounded-lg shadow-md">
                <p className="font-semibold">
                  {getLocalTime(day.dt, weatherData.timezone_offset).toLocaleDateString('en-US', { weekday: 'short' })}
                </p>
                <div className="flex items-center justify-between my-2">
                  <p className="text-xl">
                    {Math.floor(day.temp.max)}°C / {Math.floor(day.temp.min)}°C
                  </p>
                  {getWeatherIcon(
                    day.weather[0]?.id,
                    day.weather[0]?.icon
                  )}
                </div>
                <p className="capitalize text-sm">
                  {day.weather[0]?.description}
                </p>
                <div className="mt-2 text-sm">
                  <p>Humidity: {day.humidity}%</p>
                  <p>Wind: {day.wind_speed} m/s</p>
                </div>
              </div>
            ))}
          </div>
        </div>
      ) : null}
    </div>
  );
};
