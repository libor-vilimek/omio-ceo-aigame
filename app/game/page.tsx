"use client";

import React, { useState } from "react";
import styles from "./page.module.css";
import Chat from "../components/chat";
import WeatherWidget from "../components/weather-widget";
import { getWeather } from "../utils/weather";
import FileViewer from "../components/file-viewer";

const FunctionCalling = () => {


  // return (
  //   <main className={styles.main}>
  //     <div className={styles.container}>
  //       <div className={styles.fileViewer}>
  //         <FileViewer />
  //       </div>
  //       <div className={styles.chatContainer}>
  //         <div className={styles.weatherWidget}>
  //           <div className={styles.weatherContainer}>
  //             <WeatherWidget {...weatherData} />
  //           </div>
  //         </div>
  //         <div className={styles.chat}>
  //           <Chat functionCallHandler={functionCallHandler} />
  //         </div>
  //       </div>
  //     </div>
  //   </main>
  // );

  return (
    <main className={styles.main}>
      <div className={styles.container}>
        <div className={styles.chatContainer}>
          <div className={styles.chat}>
            <Chat />
          </div>
        </div>
      </div>
    </main>
  );
};

export default FunctionCalling;
