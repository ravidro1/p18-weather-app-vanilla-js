import axios from "axios";

export function getWeather(lat, lot, timezone) {
  return axios
    .get(
      "https://api.open-meteo.com/v1/forecast?hourly=temperature_2m,apparent_temperature,precipitation_probability,weathercode,windspeed_10m&daily=weathercode,temperature_2m_max,temperature_2m_min,apparent_temperature_max,apparent_temperature_min,precipitation_sum&current_weather=true&timeformat=unixtime",
      {
        params: { latitude: lat, longitude: lot, timezone },
      }
    )
    .then(({ data }) => {
      console.log(data);
      // return data
      const units = {
        temp: data.hourly_units.apparent_temperature,
        windSpeed: data.hourly_units.windspeed_10m,
        precip: data.hourly_units.precipitation_probability,
        precip_daily: data.daily_units.precipitation_sum,
      };
      return {
        current: parseCurrentWeather(data, units),
        daily: parseDailyWeather(data, units),
        hourly: parseHourlyWeather(data, units),
      };
    });
}

function parseCurrentWeather({ current_weather, daily }, units) {
  const {
    temperature: currentTemp,
    windspeed: windSpeed,
    weathercode: iconCode,
  } = current_weather;

  const {
    temperature_2m_max: [highTemp],
    temperature_2m_min: [lowTemp],
    apparent_temperature_max: [highFeelsLike],
    apparent_temperature_min: [lowFeelsLike],
    precipitation_sum: [precip],
  } = daily;
  return {
    currentTemp: Math.round(currentTemp),
    highTemp: Math.round(highTemp),
    lowTemp: Math.round(lowTemp),
    highFeelsLike: Math.round(highFeelsLike),
    lowFeelsLike: Math.round(lowFeelsLike),
    windSpeed: Math.round(windSpeed),
    precip: Math.round(precip * 100) / 100,
    iconCode,
    units,
  };
}

function parseDailyWeather({ daily }, units) {
  return daily.time.map((time, index) => {
    return {
      timestamp: time * 1000,
      iconCode: daily.weathercode[index],
      maxTemp: Math.round(daily.temperature_2m_max[index]),
      units,
    };
  });
}

function parseHourlyWeather({ hourly, current_weather }, units) {
  return hourly.time
    .map((time, index) => {
      return {
        timestamp: time * 1000,
        iconCode: hourly.weathercode[index],
        temp: Math.round(hourly.temperature_2m[index]),
        feelsLike: Math.round(hourly.apparent_temperature[index]),
        windSpeed: Math.round(hourly.windspeed_10m[index]),
        precip: Math.round(hourly.precipitation_probability[index] * 100) / 100,
        units,
      };
    })
    .filter(({ timestamp }) => timestamp >= current_weather.time * 1000);
}
