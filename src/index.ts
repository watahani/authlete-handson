/* eslint-disable no-console */
import express from "express";
import request from "request-promise-native";
import * as crypto from "crypto";
import config from "./config";

const app = express();
const port = 3000;
const baseUri = "https://api.authlete.com/api/auth/";

const serviceId = config.serviceId;
const serviceSecret = config.serviceSecret;
const clientId = config.clientId;
const clientSecret = config.serviceSecret;
const headers = {
  "Content-Type": "application/json",
  accept: "application/json"
};

const option = {
  url: baseUri + "authorization/",
  method: "POST",
  headers: headers,
  auth: {
    user: serviceId,
    password: serviceSecret
  },
  body: ""
};

app.get("/login/", (req, res): void => {
  const codeChallenge = "E9Melhoa2OwvFrEMTJguCHaoeK1t8URWbuGJSstw-cM";
  const codeChallengeMethod = "S256";
  const redirectUri = "http://localhost:3000/cb/";
  let params = "redirect_uri=" + redirectUri;
  params += "&response_type=code&client_id=13318871878972";
  params += "&code_challenge=" + codeChallenge;
  params += "&code_challenge_method=" + codeChallengeMethod;

  const body = {
    parameters: params
  };

  const startCodeRequsetOption = Object.assign({}, option);
  startCodeRequsetOption.body = JSON.stringify(body);
  console.log("POST:" + option.url);
  request(startCodeRequsetOption).then((authleteTicketResponse): void => {
    console.log("authleteTicketResponse: ", authleteTicketResponse);
    const ticket = JSON.parse(authleteTicketResponse).ticket;
    const tokenRequest = { ticket: ticket, subject: "testuser01" };
    const requestCodeRequsetOption = Object.assign({}, option);
    requestCodeRequsetOption.url = baseUri + "authorization/issue/";
    requestCodeRequsetOption.body = JSON.stringify(tokenRequest);
    console.log("code request:", JSON.stringify(tokenRequest));
    request(requestCodeRequsetOption).then((authleteCodeReponse): void => {
      const codeResponse = JSON.parse(authleteCodeReponse);
      console.log("codeRresponse: ", codeResponse);
      res.redirect(codeResponse.responseContent);
    });
  });
});

app.get("/cb", (req, res): void => {
  console.log(req.query);
  console.log(typeof req.query);
  const requestTokenOprion = Object.assign({}, option);
  requestTokenOprion.url = baseUri + "token";
  const codeVerifier = "dBjftJeZ4CVP-mB92K27uhbUJU1p1r_wW1gFWFOEjXk";
  const sha256 = crypto.createHash("sha256");
  sha256.update(codeVerifier);
  console.log(sha256.digest("base64"));
  const params = [
    "grant_type=authorization_code",
    "code=" + req.query.code,
    "redirect_uri=http://localhost:3000/cb/",
    "code_verifier=" + codeVerifier
  ].join("&");

  requestTokenOprion.body = JSON.stringify({
    clientId: clientId,
    clientSecret: clientSecret,
    parameters: params
  });
  request(requestTokenOprion).then((body): void => {
    console.log("token: ", body);
    res.send(body);
  });
});

app.get("/auth", (req, res): void => {
  console.log(req);
  res.send(req);
});

app.listen(port, () => console.log(`Example app listening on port ${port}!`));
