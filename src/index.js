import "./style.css"
import rain from "./assets/svg/rain.svg"

const currentWeatherImage = document.querySelector("#current-weather-image")
currentWeatherImage.src = rain
;(async function () {
    const descriptionElement = document.querySelector(".main.description")
    const tempElement = document.querySelector(".main.temperature")
    const cityElement = document.querySelector(".main.city")
    const dateElement = document.querySelector(".main.date")
    const feelsLikeElement = document.getElementById("feels-like")
    const humidityElement = document.getElementById("humidity")

    updateData()
    getCurrentTime()

    //*******
    async function updateData() {
        const data = await fetchWeatherData(
            "https://api.openweathermap.org/data/2.5/weather?q=De+Pere&units=imperial&appid=02b099a38aaee9f9a5aa9079418510c9"
        )
        setWeatherToday(await data)
        setWeatherInfo(await data)
        const date = new Date()
        setDate()
        setTimeout(() => {
            updateData()
        }, 60 * 60 * 1000 - date.getMinutes() * 60 * 1000)
    }

    async function setWeatherInfo(data) {
        let temp = data.main.feels_like
        temp = round(parseFloat(temp))
        const humidity = data.main.humidity

        feelsLikeElement.textContent = temp + " °F"
        humidityElement.textContent = humidity + "%"
    }

    async function setWeatherToday(data) {
        const description = capitalize(data.weather[0].description)
        const temperature = data.main.temp + " °F"
        const city = data.name

        descriptionElement.textContent = description
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

function getCurrentTime() {
    const date = new Date()
    let hh = date.getHours()
    let mm = date.getMinutes()
    let ss = date.getSeconds()
    const session = hh < 12 ? "AM" : "PM"

    hh = hh < 10 ? "0" + hh : hh
    mm = mm < 10 ? "0" + mm : mm
    ss = ss < 10 ? "0" + ss : ss

    const time = `${hh % 12}:${mm}:${ss} ${session}`
    document.getElementById("clock").textContent = time
    let t = setTimeout(() => {
        getCurrentTime()
    }, 1000)
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
    console.log(num)
    return Math.round(num * 10) / 10
}
