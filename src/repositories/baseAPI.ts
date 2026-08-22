export const URL_AMBIENTE = window.location.href;

// export const URL_API_PRD_EXT = "http://fernandogasparjr.ddns.net:8075";
export const URL_API_PRD_EXT = "https://api.fernandogasparjr.com";
// `localhost` resolves to IPv6 on this machine and reaches the WSL relay,
// not the Python API started on Windows. Use IPv4 explicitly in development.
export const URL_API_PRD_INT = "http://127.0.0.1:5000";
export const URL_API = URL_AMBIENTE!.includes("fernandogaspar")
  ? URL_API_PRD_EXT
  : URL_API_PRD_INT;


export const URL_API_HOME_PRD_EXT = "http://fernandogasparjr.ddns.net:9077";
export const URL_API_HOME_PRD_INT = "http://locahost:9077";
export const URL_API_HOME = URL_AMBIENTE!.includes("fernandogaspar") ? URL_API_HOME_PRD_EXT : URL_API_HOME_PRD_INT;

// export const URL_API_HOME = URL_API_HOME_PRD_EXT;

