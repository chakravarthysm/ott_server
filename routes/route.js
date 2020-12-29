"use strict";
export default (server) => {
   server.route({
       method: "GET",
       path: "/",
       handler: (request, h) => {
           return "Root! nothing here"
       }
   })

   server.route({
    method: "POST",
    path: "/auth/signup",
    options:{
        cors: true,
        payload: {
            parse: true,
        }
    },
    handler: (request, h) => {
        console.log(request.payload)
        return h.response(request.payload).type("application/json").code(200)
    }
})
};