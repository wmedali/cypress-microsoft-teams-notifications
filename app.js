//
// Copyright (c) Microsoft. All rights reserved.
// Licensed under the MIT license.
//
const crypto = require("crypto");
const express = require("express");
const axios = require("axios");
const bodyParser = require("body-parser");

const app = express();

app.use(bodyParser.urlencoded({ extended: true }));
app.use(bodyParser.json({ limit: "50mb" }));
app.use(express.static("reports"));

var PORT = process.env.port || process.env.PORT || 8080;
//Token = HXISR/4qUASmscgnrz0fuRKL7I9pLFye0XfihqSIlFQ=

var data = JSON.stringify({
  templateParameters: {},
});

let getConfig = (buildId) => {
  return {
    method: "post",
    url: `https://dev.azure.com/edenred-hq/FleetAndMobility/_apis/pipelines/${buildId}/runs?api-version=6.0-preview.1`,
    headers: {
      Authorization: "Basic TOKEN",
      "Content-Type": "application/json",
    },
    data: data,
  };
};

let returnMessage = (runUrl, status = "Suivre l'execution") => {
  return {
    type: "message",
    attachments: [
      {
        contentType: "application/vnd.microsoft.card.adaptive",
        contentUrl: null,
        content: {
          type: "AdaptiveCard",
          version: "1.4",
          body: [
            {
              type: "TextBlock",
              text: "FuelMal commence à tourner, tu peux chercher ta bière en attendant ☕",
            },
          ],
          actions: [
            {
              type: "Action.OpenUrl",
              title: status,
              url: runUrl,
            },
          ],
        },
        name: null,
        thumbnailUrl: null,
      },
    ],
  };
};

let getPipelineId = (scopeName) => {
  const pipelines = [
    {
      name: "Extranet",
      id: 384,
    },
    {
      name: "Subscription",
      id: 486,
    },
    {
      name: "Authentication",
      id: 418,
    },
    {
      name: "Tests",
      id: 438,
    },
  ];

  const pipeline = pipelines.find((pipeline) => pipeline.name === scopeName);
  return pipeline.id;
};
app.post("/fuelman", (req, res) => {
  var payload = req.body;
  try {
    // Retrieve authorization HMAC information
    var receivedMsg = payload;

    // The text received to webhook
    var receivedText = receivedMsg.text;

    // The message sent by webhook
    var responseMsg = "";
    const apps = ["Extranet", "Subscription", "Authentication", "Tests"];
    let app = apps.find((element) => receivedText.includes(element));
    if (!app) app = "Tests";

    let buildId = getPipelineId(app);

    let config = getConfig(buildId);
    // Creating adaptive card response
    axios(config)
      .then(function (response) {
        console.log(JSON.stringify(response.data));
        responseMsg = returnMessage(response.data._links.web.href);
        res.json(responseMsg);
        res.end();
      })
      .catch((err) => {
        console.log(err);
        const errorResponse = returnMessage("VIDE", "Erreur d'execution");
        res.json(errorResponse);
        res.end();
      });
  } catch (err) {
    res.status(400);
  }
});

app.listen(PORT);
console.log(`Server Started on port: ${PORT}`);
