import React, { useState, useEffect } from 'react'
import * as geolib from 'geolib'
import lookup from 'country-code-lookup'
import styles from './Distance.module.css'

const Distance = ({ myPosition }) => {
  const [distance, setDistance] = useState()
  const [issPosition, setIssPosition] = useState({
    longitude: myPosition.longitude,
    latitude: myPosition.latitude,
  })
  const [issInfo, setIssInfo] = useState()
  const [location, setLocation] = useState()
  const [countryCodeData, setCountryCodeData] = useState()

  useEffect(() => {
    // wrap fetch call inside an async function
    const getData = async () => {
      const url = 'https://api.wheretheiss.at/v1/satellites/25544?units=miles'
      const res = await fetch(url)
      const data = await res.json()
      const info = {
        longitude: data.longitude,
        latitude: data.latitude,
        altitude: round(data.altitude),
        velocity: round(data.velocity),
        visibility: data.visibility,
        solar_lat: data.solar_lat,
        solar_lon: data.solar_lon,
      }
      setIssInfo(info)
      const position = {
        longitude: info.longitude,
        latitude: info.latitude,
      }
      // calculate distance using geolib library
      const distanceFromIss = geolib.getDistance(myPosition, position)
      const distanceFromIssMiles = geolib.convertDistance(distanceFromIss, 'mi')
      setIssPosition(position)
      setDistance(round(distanceFromIssMiles))
    }
    // set delay on how often the api gets called
    const timer = setInterval(() => {
      getData() // MAYBE SHOULD SET INTERVAL ON myPosition INSTEAD OF INSIDE OF THIS EFFECT
    }, 3000) // 3 seconds

    return () => clearTimeout(timer)
  }, [myPosition])

  useEffect(() => {
    // get coordinate information using the issPosition
    const getData = async () => {
      const url = `https://api.wheretheiss.at/v1/coordinates/${issPosition.latitude},${issPosition.longitude}`
      const res = await fetch(url)
      const data = await res.json()
      console.log('coord data', data)
      const info = {
        countryCode: data.country_code,
        mapUrl: data.map_url,
        offset: data.offset,
        timezoneId: data.timezone_id,
      }
      setLocation(info)
      info.countryCode === '??' || info.countryCode === undefined
        ? setCountryCodeData({})
        : setCountryCodeData(lookup.byInternet(info.countryCode))
    }

    getData()
  }, [issPosition])

  console.log('countrycodedata', countryCodeData)

  if (!distance) return <h1>Loading...</h1>
  else {
    return (
      <div className={styles.apiInfo}>
        <div className={styles.positionInfo}>
          <h3>ISS Position</h3>
          <p>Latitude: {issPosition.latitude}</p>
          <p>Longitude: {issPosition.longitude}</p>
          <h3>Distance from your Location</h3>
          <p>{distance} miles</p>
          <h3>Other Info</h3>
          <p>Altitude: {issInfo.altitude} miles</p>
          <p>Velocity: {issInfo.velocity} mph</p>
          <p>Visibility: {issInfo.visibility}</p>
          <p>Solar Latitude: {issInfo.solar_lat}</p>
          <p>Solar Longitude: {issInfo.solar_lon}</p>
        </div>
        <div className={styles.locationInfo}>
          <h3>ISS Location Information</h3>
          <p>Country Code: {location.countryCode}</p>
        </div>
      </div>
    )
  }
}

export default Distance

function round(number) {
  return Math.round((number + Number.EPSILON) * 100) / 100
}
