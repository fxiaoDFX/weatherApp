import "./style.css"
import thermostat from "./assets/svg/thermostat.svg"
import hygrometer from "./assets/svg/humidity.svg"
import searchIcon from "./assets/svg/search.svg"
;(async function () {
    const currentWeatherImage = document.querySelector("#current-weather-image")
    const descriptionElement = document.querySelector(".main.description")
    const tempElement = document.querySelector(".main.temperature")
    const cityElement = document.querySelector(".main.city")
    const dateElement = document.querySelector(".main.date")
    const feelsLikeElement = document.getElementById("feels-like")
    const humidityElement = document.getElementById("humidity")
    const forecastElement = document.getElementById("forecast")
    const feelsLikeImgElement = document.getElementById("feels-like-image")
    const humidityImgElement = document.getElementById("humidity-image")
    const searchImgElement = document.getElementById("search-image")
    const formElement = document.getElementById("search-form")
    const input = document.getElementById("city-input")

    let timer = null

    feelsLikeImgElement.src = thermostat
    humidityImgElement.src = hygrometer
    searchImgElement.src = searchIcon

    updateData("De+Pere")

    formElement.addEventListener("submit", (e) => {
        e.preventDefault()
        const location = input.value.toLowerCase().trim().split(" ").join("+")
        try {
            updateData(location)
        } catch (err) {
            console.log(`Error: ${err}`)
        } finally {
            input.value = ""
        }
    })

    //*******
    async function updateData(location) {
        let isError = false
        const currentWeatherData = await fetchWeatherData(
            `https://api.openweathermap.org/data/2.5/weather?q=${location}&units=imperial&appid=02b099a38aaee9f9a5aa9079418510c9`
        )

        let lon, lat
        try {
            lon = currentWeatherData.coord.lon
            lat = currentWeatherData.coord.lat
        } catch (err) {
            console.log(`Error: ${err}, coordinates not found`)
            isError = true
        }

        if (!isError) {
            if (timer) clearInterval(timer)
        } else return

        const forecastData = await fetchWeatherData(
            `https://api.openweathermap.org/data/2.5/forecast?units=imperial&lat=${lat}&lon=${lon}&appid=02b099a38aaee9f9a5aa9079418510c9`
        )

        timer = setInterval(async () => {
            getCurrentTime(await currentWeatherData)
        }, 1000)
        setWeatherToday(await currentWeatherData)
        setWeatherInfo(await currentWeatherData)
        setForecast(await forecastData)
        const date = new Date()
        setDate()
        setTimeout(() => {
            updateData()
        }, 60 * 60 * 1000 - date.getMinutes() * 60 * 1000)
    }

    function getIconUrl(icon) {
        return `https://openweathermap.org/img/wn/${icon}@2x.png`
    }

    async function setForecast(data) {
        if (data.cod != 200) {
            console.log("Error:", data)
            return
        }

        console.log("wtf")
        const list = data.list
        const forecast = []
        list.forEach((day) => {
            forecast.push(day)
        })

        clearElements(forecastElement)

        const date = new Date()
        const today = date.getDay()
        for (let i = 1; i < 8; i++) {
            const day = getDay(today + i)
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

    async function setWeatherInfo(data) {
        if (data.cod != 200) return
        let temp = data.main.feels_like
        temp = round(parseFloat(temp))
        const humidity = data.main.humidity

        feelsLikeElement.textContent = temp + " °F"
        humidityElement.textContent = humidity + "%"
    }

    async function setWeatherToday(data) {
        if (data.cod != 200) return
        const description = capitalize(data.weather[0].description)
        const temperature = data.main.temp + " °F"
        const city = data.name
        const icon = data.weather[0].icon

        descriptionElement.textContent = description
        currentWeatherImage.src = getIconUrl(icon)
        tempElement.textContent = round(parseFloat(temperature)) + " °F"
        cityElement.textContent = city
    }

    function setDate() {
        dateElement.textContent = getDateString()
    }
})()

async function fetchWeatherData(url) {
    try {
        const response = await fetch(url)
        return await response.json()
    } catch (err) {
        console.log(`Error: ${err}`)
    }
}

async function getCurrentTime(data) {
    if (data.cod != 200) return
    const timezone = data.timezone
    const offset = timezone / 3600
    const date = new Date()

    let hh = (date.getUTCHours() + offset) % 12
    hh = hh === 0 ? 12 : hh
    let mm = date.getMinutes()
    let ss = date.getSeconds()
    const session = hh < 12 ? "AM" : "PM"

    hh = hh < 10 ? "0" + hh : hh
    mm = mm < 10 ? "0" + mm : mm
    ss = ss < 10 ? "0" + ss : ss

    const time = `${hh}:${mm}:${ss} ${session}`
    document.getElementById("clock").textContent = time
}

function getDateString() {
    const date = new Date()
    return (
        getDay(date.getDay()) +
        ", " +
        getMonth(date.getMonth()) +
        " " +
        date.getDate() +
        " " +
        date.getFullYear()
    )
}

function getMonth(num) {
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

function getDay(num) {
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

function capitalize(string) {
    const words = string.split(" ")
    return words
        .map((word) => {
            return word[0].toUpperCase() + word.substring(1)
        })
        .join(" ")
}

function round(num) {
    return Math.round(num * 10) / 10
}
