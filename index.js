import express, { urlencoded, json } from "express";
import http from "http";
import dotenv from "dotenv";

import userRoute from "./routes/userRoute.js";

import sequelize from "./database.js";

dotenv.config();

const app = express();
app.use(urlencoded({ extended: true }));
app.use(express.static("uploads"));
app.use(json());

// routes
app.use("/user", userRoute);

const server = http.createServer(app);

const port = process.env.PORT;

server.listen(port, () => {
  console.log(`Listening at port ${port || 8081}`);
});
