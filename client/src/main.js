import '@picocss/pico/css/pico.min.css'
import './app.css'
import App from './App.svelte'

const app = new App({
  target: document.querySelector('main'),
})

export default app
