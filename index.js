"use strict";
import Hapi from "@hapi/hapi";
import router from "./routes/route.js";

const init = async () => {
    const server = Hapi.Server({
        port: 3000,
        host: "localhost"
    });
    router(server);
    await server.start();
    console.log("Server running on %s", server.info.uri);
}

process.on("unhandledrejection", (err) => {
    console.log(err);
    process.exit(1)
});

init();