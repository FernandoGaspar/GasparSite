export const URL_AMBIENTE = window.location.href;

export const URL_API_PRD_EXT = "http://fernandogasparjr.ddns.net:8075";
export const URL_API_PRD_INT = "http://192.168.31.201:8075";
export const URL_API = URL_AMBIENTE!.includes("fernandogaspar") ? URL_API_PRD_EXT : URL_API_PRD_INT;

// export const URL_API = URL_API_PRD_EXT;


export const URL_API_HOME_PRD_EXT = "http://fernandogasparjr.ddns.net:9077";
export const URL_API_HOME_PRD_INT = "http://192.168.31.201:9077";
export const URL_API_HOME = URL_AMBIENTE!.includes("fernandogaspar") ? URL_API_HOME_PRD_EXT : URL_API_HOME_PRD_INT;

// export const URL_API_HOME = URL_API_HOME_PRD_EXT;

