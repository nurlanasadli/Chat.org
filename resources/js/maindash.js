import { createApp } from "vue";
import store from "./store/index";
import MainApp from "./Pages/Chat/MainApp.vue";

    const app1 = createApp(MainApp);

    app1.use(store);
    app1.mount("#app");