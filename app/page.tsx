"use client";

import React from "react";
import styles from "./page.module.css";

const Home = () => {
  const categories = {
    Game: "game",
  };

  return (
    <main className={styles.main}>
      <div className={styles.title}>
        Click and start to play
      </div>
      <div className={styles.container}>
        {Object.entries(categories).map(([name, url]) => (
          <a key={name} className={styles.category} href={`/game`}>
            {name}
          </a>
        ))}
      </div>
    </main>
  );
};

export default Home;
