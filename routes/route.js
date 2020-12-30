"use strict";
import Joi from 'joi';
import { v4 as uuidv4 } from 'uuid';
import redis from 'redis';
import bcrypt from 'bcrypt';
import JWT from 'jsonwebtoken';
import _ from 'lodash';

import { createUser, getUser } from "../db/db.js"


export default (server) => {
    server.route({
        method: "GET",
        path: "/",
        options: {
            auth: false
        },
        handler: (request, h) => {
            return "Root! nothing here"
        }
    })

    server.route({
        method: "GET",
        path: "/restricted",
        handler: (request, h) => {
            return "Restricted"
        }
    })

    server.route({
        method: "POST",
        path: "/auth/signup",
        options: {
            cors: true,
            auth: false,
            payload: {
                parse: true,
            },
            validate: {
                payload: Joi.object({
                    firstName: Joi.string(),
                    lastName: Joi.string(),
                    dob: Joi.date(),
                    email: Joi.string().pattern(new RegExp(/[a-z0-9!#$%&'*+/=?^_`{|}~-]+(?:\.[a-z0-9!#$%&'*+/=?^_`{|}~-]+)*@(?:[a-z0-9](?:[a-z0-9-]*[a-z0-9])?\.)+[a-z0-9](?:[a-z0-9-]*[a-z0-9])?/)),
                    password: Joi.string().pattern(new RegExp(/^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[@$!%*?&])[A-Za-z\d@$!%*?&]{1,4}$/)),
                    confirmPassword: Joi.string().pattern(new RegExp(/^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[@$!%*?&])[A-Za-z\d@$!%*?&]{1,4}$/))
                }),
                failAction: "error"
            },
        },
        handler: async (request, h) => {
            console.log(request.payload)
            try {
                const salt = bcrypt.genSaltSync(10);
                const passwordHash = bcrypt.hashSync(request.payload.password, salt);
                const userData = {
                    id: uuidv4(),
                    firstname: request.payload.firstName,
                    lastname: request.payload.lastName,
                    dob: request.payload.dob,
                    salt: salt,
                    email: request.payload.email,
                    password: passwordHash,
                }

                let response = await createUser(_.values(userData))
                if (response.error) {
                    return h.response({ err: "An internal error occured" }).type("application/json").code(500)
                }

                return h.response(_.omit(response.data, ["salt", "password"])).type("application/json").code(200)
            } catch (e) {
                return h.response({ err: "An internal error occured" }).type("application/json").code(500)
            }
        }
    })

    server.route({
        method: "POST",
        path: "/auth/login",
        options: {
            cors: true,
            auth: false,
            payload: {
                parse: true,
            },
            validate: {
                payload: Joi.object({
                    email: Joi.string().pattern(new RegExp(/[a-z0-9!#$%&'*+/=?^_`{|}~-]+(?:\.[a-z0-9!#$%&'*+/=?^_`{|}~-]+)*@(?:[a-z0-9](?:[a-z0-9-]*[a-z0-9])?\.)+[a-z0-9](?:[a-z0-9-]*[a-z0-9])?/)),
                    password: Joi.string().pattern(new RegExp(/^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[@$!%*?&])[A-Za-z\d@$!%*?&]{1,4}$/))
                }),
                failAction: "error"
            },
        },
        handler: async (request, h) => {
            try {
                let response = await getUser([request.payload.email])
                if (response.error) {
                    return h.response({ err: "An internal error occured" }).type("application/json").code(500)
                }

                if (response.data.length === 0 || !response.data.active) {
                    return h.response({ err: "Access denied" }).type("application/json").code(401)
                }

                if (!bcrypt.compareSync(request.payload.password, response.data.password)) {
                    return h.response({ err: "Credentials are invalid" }).type("application/json").code(401)
                }

                const session = {
                    valid: true,
                    id: uuidv4(),
                    profileData: _.omit(response.data, ["salt", "password"]),
                    exp: new Date().getTime() + 30 * 60 * 1000
                }

                const client = redis.createClient();

                client.on("error", function (error) {
                    return h.response({ err: "An internal error occured" }).type("application/json").code(500)
                });

                client.set(session.id, JSON.stringify(session))
                const token = JWT.sign(session, `l)o*vI6k@y"Oo;pDd9/@q2+&GnX"_jM=*P=lgnZfE+$B{8}ak775p[anb[A%e9P5xQ8g/5c{XF:^?R]8ZSHRCjZ[Vgem{;,IoF=L<gGD,(Jz%05&H1-x?:tQ@HPffo`)
                return h.response(request.payload).header("Authorization", token).type("application/json").code(200)
            } catch (e) {
                return h.response({ err: "An internal error occured" }).type("application/json").code(500)
            }
        }
    })
};