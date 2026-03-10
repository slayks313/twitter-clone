# Vue 3 + Vite

This template should help get you started developing with Vue 3 in Vite. The template uses Vue 3 `<script setup>` SFCs, check out the [script setup docs](https://v3.vuejs.org/api/sfc-script-setup.html#sfc-script-setup) to learn more.

Learn more about IDE Support for Vue in the [Vue Docs Scaling up Guide](https://vuejs.org/guide/scaling-up/tooling.html#ide-support).
---

## APK download for web users
To offer your Android app directly from the web site:

1. Place the zipped APK file in the `public/` folder of this project, for example `public/app.zip` (you can use any name but match the link below).
2. The application already includes a download link in the sidebar and on the login page:
   ```html
   <a href="/app.zip" download>Скачать мобильное приложение</a>
   ```
   Visitors (logged in or not) can click it to fetch the APK archive.
3. You may adjust the filename or add additional UI elements as needed.

The static asset will be served at `https://<your-domain>/app.zip` after deployment.