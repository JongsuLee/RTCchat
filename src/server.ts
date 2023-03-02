import express from "express";
import http from "http";

const app = express();

const server = http.createServer(app);

server.listen(5000, () => console.log("Listening to http://localhost:5000"));
