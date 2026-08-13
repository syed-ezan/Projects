import dotenv from "dotenv"
dotenv.config()

import { app } from "./app.js"
import { connectDB } from "./db/db.js"

connectDB()

app.listen(process.env.PORT, () => {
    console.log(`On PORT ${process.env.PORT}`);
})



