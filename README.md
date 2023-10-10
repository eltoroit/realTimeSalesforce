# Real-Time Salesforce

### Demo Steps

1. Create Scratch Org
   1. Ensure you have [ETCopyData](https://github.com/eltoroit/etcopydata) SFDX plugin to load the data for the new scratch org.
      - `sfdx plugins | grep "etcopydata"`
   2. Clone this Github repo: [https://github.com/eltoroit/realTimeSalesforce](https://github.com/eltoroit/realTimeSalesforce) and navigate to that folder
      - `git clone https://github.com/eltoroit/realTimeSalesforce.git`
      - `cd realTimeSalesforce`
   3. Open the project in VS Code, located at `<REPO>/ScratchOrg`
      - `code ScratchOrg`
   4. Open the terminal window
   5. Install the required npm libraries
      - `npm install`
   6. Create scratch org
      - `npm run createOrg`
2. Setup ORG
   1. On the browser, open up the new Scratch Org
      - During the creation of the scratch org, the setup window was opened showing the deployment status. you can reuse that window.
      - If the window was closed, you can use `sf org open`
   2. Verify your email address is associated with the scratch org owner `user user`
      1. Click on astro avatar
      2. Click on `User User`
      3. Update the email if needed
   3. Grab the credentials for the connected app
      1. Navigate to `Setup> Apps > App Manager` (_**/lightning/setup/NavigationMenus/home**_)
      2. Find and view the connected app named `RealTimeSalesforce`
      3. Click `Manage Consumer Details` and follow instructions
      4. Copy the values in a new tab in VS Code
   4. Enable Username/Password oAuth flow
      1. Navigate to `Setup > OAuth and OpenID Connect Settings` (_**/lightning/setup/OauthOidcSettings/home**_)
      2. Toggle `Allow OAuth Username-Password Flows` to enable this, click `OK`
3. Update variables in Postman

   1. In VS Code, open the file `etLogs/_user.json` located inside the scratch org
   2. On a browser, [login to your](https://identity.getpostman.com/login) Postman account
   3. Create a new workspace
      1. From the `Workspaces` menu, click on `Create Workspace`
      2. Select blank workspace and click `Next`
      3. Give it a name ad select the access (Personal, Team, Parner, or Public)
      4. Click `Create`
   4. Import the [JSON file with the collection definition](/Other%20Files/Postman_collection.json) collection
      1. Click the `Import` button
      2. Enter this URL: [https://raw.githubusercontent.com/eltoroit/realTimeSalesforce/master/Other%20Files/ELTORO.IT%20Demos%20-%20Real-Time%20Salesforce.postman_collection.json](https://raw.githubusercontent.com/eltoroit/realTimeSalesforce/master/Other%20Files/ELTORO.IT%20Demos%20-%20Real-Time%20Salesforce.postman_collection.json)
   5. Open the `variables` tab for that collection
   6. For these variables, ensure the `Current values` column has these values:

      | Variable     | Current Value                                                                                         |
      | ------------ | ----------------------------------------------------------------------------------------------------- |
      | url          | https://test.salesforce.com                                                                           |
      | username     | Copy this from the `_user.json` file                                                                  |
      | password     | Copy this from the `_user.json` file                                                                  |
      | clientId     | This is the `Consumer Key` obtained in the previous step                                              |
      | clientSecret | This is the `Consumer Secret` obtained in the previous step                                           |
      | SecretToken  | Leave this blank because the IP Ranges (0.0.0.0 ~ 255.255.255.255) have been set in the Admin profile |

   7. Click `Persist all` to copy the values from `Current Value` to `Initial Value`
      - ❌ **WARNING**: DO NOT click the _reset_ button or you need to go back to the previous step since this does the opposite operation from what we want.
   8. Click `Save`

4. Validate settings are correct
   1. Postman must be using the `Desktop Agent` for the requests, specially for the Streaming API demo.
      - Make sure you install the required software from here: [https://www.postman.com/downloads/postman-agent/](https://www.postman.com/downloads/postman-agent/)
      - Ensure the agent selected on the bottom right corner next to Cookies is set to `Desktop Agent`
      - You may need to select `Auto-Select Agent`
      - Toggle the `Auto-Select` off
      - Select `Desktop Agent`
   2. Open the `/UNPW OAuth Tester` request in root of this this collection
   3. Click `Send`
   4. Validate
      1. You should receive a valid `access_token`
      2. The `instance_url` should be valid for your scratch org
5. Now that we know the oAuth is properly configured, let Postman get its own access token
   1. Open the collection
   2. Click the `Authorization` tab for the collection
   3. At the bottom of the page, click the `Get New Access Token` button
   4. Follow the oAuth prompts
   5. Click `Proceed`
   6. Click `Use Token`
6. Let's use the access token inside Postman
   1. Find the `REST Query Account (OAuth)` request in root of this this collection
   2. Click `Send`
   3. You should receive a response with 2 records
7. Streaming API demo

   1. Postman must be using the `Desktop Agent` for the requests in this demo (see directions above)
   2. The `Streaming API` folder has 2 subfolders:
      1. `Subscriber (Run This!)` is the actual implementation of Streaming API subscriber that uses long-polling
         1. Open the `Postman console` to see the different requests/responses in action
         2. Select the `Pre-request Script` tab in this folder to configure the demo by indicating which event you want, and the replay Id.
            - Change the value in `line 16` to indicate which `channel` to subscribe to
            - Change the value in `line 6` to indicate the value of the `replay Id`
         3. Click `Run`, a new tab should open
         4. Click `Run ELTORO.IT Salesforce Postman Demos` to see the requests/responses in action
      2. `Publisher` allows you to publish new events on the bus
         - Use the proper request in the `Publisher` folder to publish the event needed to trigger the subscriber
         - Note: Generic events need to execute 2 requests in order. The first one gets the channel ID, the second one pblishes on that channel.
      3. For a better experience, use two browser tabs

8. gRPC Demo
   1. Open a new VS Code window for the `<REPO>/gRPC/SimpleDemo` folder
   2. Install packages: `npm install`
   3. Split the terminal in two panels side-by-side
   4. Run the gRPC server `npm run server` on one panel
   5. Run the gRPC client `npm run client` on the other panel
9. PubSub API Demo

   1. Open a new VS Code window for the `<REPO>/gRPC/PubSub` folder
   2. Install packages: `npm install`
   3. Create a new `.env` file with these entries

      | Key                  | Value                                |
      | -------------------- | ------------------------------------ |
      | SALESFORCE_AUTH_TYPE | username-password                    |
      | SALESFORCE_LOGIN_URL | https://test.salesforce.com          |
      | SALESFORCE_USERNAME  | Copy this from the `_user.json` file |
      | SALESFORCE_PASSWORD  | Copy this from the `_user.json` file |
      | SALESFORCE_TOKEN     | _leave blank_                        |
      | PUB_SUB_ENDPOINT     | api.pubsub.salesforce.com:7443       |

   4. Run the PubSub API client `npm run client`
   5. Go back to Postman and publish an event
      - Use the proper request in the `Publisher` folder to publish the event needed to trigger the subscriber
      - Note: Generic events need to execute 2 requests in order. The first one gets the channel ID, the second one pblishes on that channel.

10. Basic WebSockets Demo
    1. Open a new VS Code window for the `<REPO>/WebSockets/Basic` folder
    2. Install packages: `npm install`
    3. Run the WebSocket server `npm run serve`
    4. Open a new browser tab and navigate to [http://localhost:3000/](http://localhost:3000/)
       - This opens a simple chat application
    5. Duplicate the tab and put both tabs side to side.
    6. Start chatting 😀
11. LWC + WebSockets Demo
    1. Test the [WebSockets server on Heroku](https://et-realtimesf-basicws-6b1e66624e2a.herokuapp.com/)
       - The code for this server is here: `<REPO>/WebSockets/LWC`
       1. Open a browser tab and navigate to [https://et-realtimesf-basicws-6b1e66624e2a.herokuapp.com/](https://et-realtimesf-basicws-6b1e66624e2a.herokuapp.com/)
       2. Click on the `Click Me` button, notice the `ping` and `pong` times are different but very close.
       3. Leave that WebSockets server tab open
    2. On a new tab, open the Scratch Org
    3. Go to `App Launcher` > `LWC Demo` > `Web Sockets`
    4. Duplicate the tab
    5. Start interacting with the component
       - Type something on the textbox
       - Change the colors
       - Notice how the other component(s) get automatically updated
