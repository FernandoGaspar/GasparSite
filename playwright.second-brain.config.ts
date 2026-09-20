import {defineConfig} from '@playwright/test';
export default defineConfig({
  testDir:'./e2e',testMatch:'second-brain.spec.ts',timeout:45000,
  use:{baseURL:'http://localhost:3000',browserName:'chromium',channel:'msedge',viewport:{width:1600,height:1000},trace:'retain-on-failure'},
  workers:1,reporter:'list',outputDir:'tmp/second-brain-tests',
});
