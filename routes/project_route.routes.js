'use strict'
const express = require("express");
const api = express.Router();
const commandList = require("../controllers/commandList.controller");
const autentication = require("../middlewares/authenticated");

api.post("/commands", autentication.ensureAuth, commandList.commands);

module.exports = api;