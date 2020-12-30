import pg from 'pg'
import { addNewUser as addNewUserQuery, getUser as getUserQuery } from './queries.js';

const Pool = pg.Pool;
const pool = new Pool({
    user: 'me',
    host: 'localhost',
    database: 'ott',
    password: 'root',
    port: 5432,
})



export const createUser = async (data) => {
    let response = {}
    try {
        const dbResp = await pool.query(addNewUserQuery, data);
        response.data = dbResp.rows[0];
    } catch (e) {
        response.error = e;
    }
    return response;
}

export const getUser = async (email) => {
    let response = {}
    try {
        const dbResp = await pool.query(getUserQuery, email);
        response.data = dbResp.rows[0];
    } catch (e) {
        response.error = e;
    }
    return response;
}