import { useState } from 'react'
import reactLogo from './assets/react.svg'
import viteLogo from './assets/vite.svg'
import heroImg from './assets/hero.png'
import './App.css'
import { Chart } from './Chart'
import { ThaiChart } from './ThaiChart'

export default () => {
  return (
    <>
    {/* <Chart></Chart> */}
    <ThaiChart></ThaiChart>
    <div id="thai-map"></div>
    </>
  );
}