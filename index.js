"use strict";
import Hapi from "@hapi/hapi";
import hapiAuthJWT from "hapi-auth-jwt2";
import router from "./routes/route.js";
import redis from 'redis';


const validate = async function (decoded, request, h) {
    redis.get(decoded.id, (err, sessionData) => {
        if (err) {
            return { isValid: false };
        }
        const session = JSON.parse(sessionData);
        if (session.valid) {
            return { isValid: true };
        }
    });
};

const init = async () => {
    try {
        const server = Hapi.Server({
            port: 3000,
            host: "localhost"
        });

        router(server);

        await server.start();

        await server.register(hapiAuthJWT);
        server.auth.strategy('jwt', 'jwt',
            {
                key: 'l)o*vI6k@y"Oo;pDd9/@q2+&GnX"_jM=*P=lgnZfE+$B{8}ak775p[anb[A%e9P5xQ8g/5c{XF:^?R]8ZSHRCjZ[Vgem{;,IoF=L<gGD,(Jz%05&H1-x?:tQ@HPffo',
                validate
            });

        server.auth.default('jwt');

        console.log("Server running on %s", server.info.uri);
    } catch (e) {
        console.error(e);
    }
}

process.on("unhandledrejection", (err) => {
    console.log(err);
    process.exit(1)
});

init();