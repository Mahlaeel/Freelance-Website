import { platformBrowserDynamic } from '@angular/platform-browser-dynamic';

import { AppModule } from './app/app.module';

import { initializeApp } from "firebase/app";

platformBrowserDynamic().bootstrapModule(AppModule)
  .catch(err => console.error(err));


const firebaseConfig = {
  apiKey: "AIzaSyCVQMdEMyS-dBSwYNxBoZQkRBRhFcrQBFM",
  authDomain: "freelance-website-5b73f.firebaseapp.com",
  projectId: "freelance-website-5b73f",
  storageBucket: "freelance-website-5b73f.appspot.com",
  messagingSenderId: "1089934400220",
  appId: "1:1089934400220:web:d2beef0ec92fc3bc58b219",
  measurementId: "G-0HXGZH767B"
};

const firebaseApp = initializeApp(firebaseConfig);



