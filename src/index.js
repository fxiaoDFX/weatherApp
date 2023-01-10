import "./style.css"
import thermostat from "./assets/svg/thermostat.svg"
import hygrometer from "./assets/svg/humidity.svg"
import searchIcon from "./assets/svg/search.svg"

const currentWeatherImage = document.querySelector("#current-weather-image")
const descriptionElement = document.querySelector(".main.description")
const tempElement = document.querySelector(".main.temperature")
const cityElement = document.querySelector(".main.city")
const dateElement = document.querySelector(".main.date")
const clockElement = document.getElementById("clock")
const feelsLikeElement = document.getElementById("feels-like")
const humidityElement = document.getElementById("humidity")
const forecastElement = document.getElementById("forecast")
const feelsLikeImgElement = document.getElementById("feels-like-image")
const humidityImgElement = document.getElementById("humidity-image")
const searchImgElement = document.getElementById("search-image")
const formElement = document.getElementById("search-form")
const inputElement = document.getElementById("city-input")
const errorMessageElement = document.getElementById("error-message")
let timer = null

feelsLikeImgElement.src = thermostat
humidityImgElement.src = hygrometer
searchImgElement.src = searchIcon

renderLocationWeather("De Pere", false)

formElement.addEventListener("submit", (e) => {
    e.preventDefault()
    console.log("submitted")
    const value = inputElement.value
    renderLocationWeather(parseInputToUrl(value), true)
    inputElement.value = ""
})

function parseInputToUrl(value) {
    let url = null
    if (/^\d+$/.test(value)) {
        url = `
        https://api.openweathermap.org/data/2.5/weather?zip=${value}&units=imperial&appid=02b099a38aaee9f9a5aa9079418510c9
        `
    } else {
        url = weatherUrl(value)
    }
    return url
}

async function renderLocationWeather(location, isUrl) {
    if (isUrl) {
        const response = await fetch(location)
        location = (await response.json()).name
    }

    errorMessageElement.textContent = ""
    let locationData = null
    try {
        locationData = await fetchLocationData(weatherUrl(location))
    } catch (err) {
        console.log("Error: ", err)
        errorMessageElement.textContent = "Please enter a valid city or zipcode"
        return
    }

    clearInterval(timer)
    timer = setInterval(() => {
        utc.setDateAndTime(locationData.timezone)
    }, 1000)

    setWeather(locationData)

    const locationForecastData = await fetchForecastData(
        forecastUrl(locationData.lon, locationData.lat)
    )
    setForecast(locationForecastData)
}

async function setForecast(data) {
    const list = data.list
    const forecast = []

    list.forEach((day) => {
        forecast.push(day)
    })

    const today = utc.toNum(utc.getDay(data.city.timezone))
    clearElements(forecastElement)

    for (let i = 1; i < 8; i++) {
        const day = utc.toDay(today + i)
        const temp = forecast[i].main.temp
        const weather = forecast[i].weather[0].main.toLowerCase()

        const container = document.createElement("li")
        const dayDiv = document.createElement("div")
        const tempDiv = document.createElement("div")
        const img = document.createElement("img")

        dayDiv.textContent = day
        tempDiv.textContent = round(parseFloat(temp)) + " °F"
        img.alt = weather
        img.src = getIconUrl(forecast[i].weather[0].icon)

        container.append(dayDiv, tempDiv, img)
        forecastElement.append(container)
    }
}

function clearElements(container) {
    while (container.hasChildNodes()) {
        container.removeChild(container.childNodes[0])
    }
}

async function setWeather(data) {
    data = data.data
    let description = data.weather[0].description
    const iconId = data.weather[0].icon
    const city = data.name
    const temp = data.main.temp
    const feels = data.main.feels_like
    const humidity = data.main.humidity

    description = parseString(description)
    const iconUrl = getIconUrl(iconId)
    const response = await fetch(iconUrl)
    const url = response.url

    descriptionElement.textContent = description
    currentWeatherImage.src = url
    cityElement.textContent = city
    tempElement.textContent = round(temp) + " °F"
    feelsLikeElement.textContent = round(feels) + " °F"
    humidityElement.textContent = humidity + "%"
}

function round(temp) {
    return Math.round(temp * 10) / 10
}

function parseString(string) {
    const words = string.split(" ")
    const fixed = []
    words.forEach((word) => {
        fixed.push(word[0].toUpperCase() + word.substring(1))
    })
    return fixed.join(" ")
}

function getIconUrl(icon) {
    return `https://openweathermap.org/img/wn/${icon}@2x.png`
}

async function fetchForecastData(url) {
    const response = await fetch(url)
    const data = await response.json()
    return data
}

async function fetchLocationData(url) {
    const response = await fetch(url)
    const data = await response.json()
    const lon = data.coord.lon
    const lat = data.coord.lat
    const timezone = data.timezone

    return { data, lon, lat, timezone }
}

function forecastUrl(lon, lat) {
    return `http://api.openweathermap.org/data/2.5/forecast?lon=${lon}&lat=${lat}&units=imperial&id=524901&appid=02b099a38aaee9f9a5aa9079418510c9`
}

function weatherUrl(location) {
    location = location.toLowerCase().split(" ").join("+")
    return `https://api.openweathermap.org/data/2.5/weather?q=${location}&units=imperial&appid=02b099a38aaee9f9a5aa9079418510c9`
}

const utc = (() => {
    function setDateAndTime(timezoneOffset) {
        const offsetUTC = timezoneOffset / 3600
        const date = new Date()
        date.setUTCHours(date.getUTCHours() + offsetUTC)
        const day = toDay(date.getUTCDay())
        const month = toMonth(date.getUTCMonth())
        dateElement.textContent = `${day}, ${date.getUTCDate()} ${month} ${date.getUTCFullYear()}`

        const hh = date.getUTCHours()
        const mm = date.getUTCMinutes()
        const ss = date.getUTCSeconds()
        console.log(toTimeFormat(hh, mm, ss))
        clockElement.textContent = toTimeFormat(hh, mm, ss)
    }

    function getDay(timezoneOffset) {
        const offsetUTC = timezoneOffset / 3600
        const date = new Date()
        date.setUTCHours(date.getUTCHours() + offsetUTC)
        return toDay(date.getUTCDay())
    }

    function toMonth(num) {
        switch (num) {
            case 0:
                return "January"
            case 1:
                return "February"
            case 2:
                return "March"
            case 3:
                return "April"
            case 4:
                return "May"
            case 5:
                return "June"
            case 6:
                return "July"
            case 7:
                return "August"
            case 8:
                return "September"
            case 9:
                return "October"
            case 10:
                return "November"
            case 11:
                return "Decemeber"
            default:
                break
        }
    }

    function toDay(num) {
        num = num % 7
        switch (num) {
            case 0:
                return "Sunday"
            case 1:
                return "Monday"
            case 2:
                return "Tuesday"
            case 3:
                return "Wednesday"
            case 4:
                return "Thursday"
            case 5:
                return "Friday"
            case 6:
                return "Saturday"
            default:
                break
        }
    }

    function toNum(day) {
        switch (day) {
            case "Sunday":
                return 0
            case "Monday":
                return 1
            case "Tuesday":
                return 2
            case "Wednesday":
                return 3
            case "Thursday":
                return 4
            case "Friday":
                return 5
            case "Saturday":
                return 6
            default:
                break
        }
    }

    function toTimeFormat(hh, mm, ss) {
        const session = hh < 12 ? "AM" : "PM"
        hh = hh % 12 == 0 ? 12 : hh % 12
        mm = mm < 10 ? "0" + mm : mm
        ss = ss < 10 ? "0" + ss : ss
        return `${hh}:${mm}:${ss} ${session}`
    }
    return { setDateAndTime, getDay, toMonth, toDay, toNum, toTimeFormat }
})()
