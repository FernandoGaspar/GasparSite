import {defineConfig} from '@playwright/test';
export default defineConfig({testDir:'./e2e',testMatch:'app-brain.spec.ts',timeout:60000,workers:1,use:{baseURL:'http://localhost:8082',browserName:'chromium',channel:'msedge',viewport:{width:390,height:844}},outputDir:'tmp/app-brain-tests',reporter:'list'});
