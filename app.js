const express = require("express");
const axios = require("axios");
const bodyParser = require("body-parser");

const app = express();

app.use(bodyParser.urlencoded({ extended: true }));
app.use(bodyParser.json({ limit: "50mb" }));
app.use(express.static("reports"));

var PORT = process.env.port || process.env.PORT || 8080;
const token = "Azure devops token";

// Change this azure devops url
const base_url = "https://dev.azure.com/ORGANIZATION_NAME/PROJECT_NAME";

var data = JSON.stringify({
  templateParameters: {},
});

let getConfig = (buildId) => {
  return {
    method: "post",
    url: `${base_url}/_apis/pipelines/${buildId}/runs?api-version=6.0-preview.1`,
    headers: {
      Authorization: "Basic " + token,
      "Content-Type": "application/json",
    },
    data: data,
  };
};

let returnMessage = (runUrl, status) => {
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
              text: "Les tests tournent, tu peux chercher ta bière en attendant ☕",
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

// Supposing we have 2 pipelines to lunch, each pipeline has un unique id
let getPipelineId = (scopeName) => {
  const pipelines = [
    {
      name: "SCOPE_1",
      id: 108,
    },
    {
      name: "SCOPA_2",
      id: 103,
    },
  ];

  const pipeline = pipelines.find((pipeline) => pipeline.name === scopeName);
  return pipeline.id;
};
app.post("/mrbox", (req, res) => {
  try {
    // The text received to webhook
    var receivedText = req.body.text;

    // The message sent by webhook
    var responseMsg = "";
    const apps = ["SCOPE_1", "SCOPE_2"];
    let app = apps.find((element) => receivedText.includes(element));
    if (!app) app = "SANITY";

    let buildId = getPipelineId(app);
    // Add buildId Here
    let config = getConfig(buildId);
    // Creating adaptive card response
    axios(config)
      .then((response) => {
        console.log(JSON.stringify(response.data));
        responseMsg = returnMessage(
          response.data._links.web.href,
          "Suivre l'execution"
        );
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
