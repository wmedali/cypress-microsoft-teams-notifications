# Fuel Man

Fuel Man is a Microsoft Teams bot that triggers Automated Tests or azure devops pipelines from a Microsoft Teams message.

## Steps to run locally

### Prerequisites

- Install a tunnelling service. These instructions assume you are using ngrok: https://ngrok.com/

- Start the tunneling service, e.g. `ngrok http 8080` and copy the https:// URL it generates to the clipboard, e.g. https://2fb3f5e8.ngrok.io

- Create the Outgoing Webhook in Teams using the instructions [here](https://docs.microsoft.com/en-us/microsoftteams/platform/concepts/custom-bot).

In "Callback URL" box, type the tunneling service URL from the previous and add `/fuelman` eg : https://2fb3f5e8.ngrok.io/fuelman
