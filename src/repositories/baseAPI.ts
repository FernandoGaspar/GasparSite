export const URL_AMBIENTE = window.location.href;

// export const URL_API_PRD_EXT = "http://fernandogasparjr.ddns.net:8075";
export const URL_API_PRD_EXT = "https://api.fernandogasparjr.com";
export const URL_API_PRD_INT = "http://192.168.32.215:5000";
export const URL_API = URL_AMBIENTE!.includes("fernandogaspar")
  ? URL_API_PRD_EXT
  : URL_API_PRD_INT;


export const URL_API_HOME_PRD_EXT = "http://fernandogasparjr.ddns.net:9077";
export const URL_API_HOME_PRD_INT = "http://locahost:9077";
export const URL_API_HOME = URL_AMBIENTE!.includes("fernandogaspar") ? URL_API_HOME_PRD_EXT : URL_API_HOME_PRD_INT;

// export const URL_API_HOME = URL_API_HOME_PRD_EXT;

