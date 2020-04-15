# ChocShop: Alexa Skills

This is a VUI for Alexa, to complement the [ChocShop](https://www.github.com/mikaelvesavuori/chocshop) demo.

The repository assumes that you've already set up accounts at AWS and Alexa Developer Console, and done some initial pre-work.

Included you will find the data I am using, example JSON events, and a couple of helper Bash scripts.

## Connected repositories

There's a range of repos that are connected to the overall ChocShop demo.

For the frontend, you would also need the backend repo to be deployed, or at the very least point to local data unless you want the app to crash.

The VUI apps are entirely elective.

- [ChocShop: Frontend](https://github.com/mikaelvesavuori/chocshop): The main demo app, as seen on [https://chocshop.netlify.app](https://chocshop.netlify.app)
- [ChocShop: Backend](https://github.com/mikaelvesavuori/chocshop-backend): The basic API backend to send back stock status and price
- [ChocShop: Google Assistent](https://github.com/mikaelvesavuori/chocshop-assistent): VUI assistent which gives you a basic product overview, stock status and price information

## Workflow

I experimented with Serverless Framework very briefly but seeing that the plugin `serverless-alexa-skills` was going on being 2 years old without updates, and that it was in no way really that slick anyway, I just resorted to a bit of a manual workflow.

- Have your favorite code editor open and work your magic touch
- Go to [Alexa Developer Console](https://developer.amazon.com/alexa/console/ask/) and keep this in a tab
- I initially set up a Serverless Application Repository project (`Fact Skill` variety) and then re-used that with my own code; you probably won't need that as long as you specify Alexa Skill as the integration type (?)
- Keep one tab open with the "Test" mode up in [Alexa Developer Console](https://developer.amazon.com/alexa/console/ask)
- Keep yet another tab open with CloudWatch logs for your function
- Keep—you guessed it—a tab open for the Lambda view in the AWS console (GUI)
- Don't forget to put your Lambda function ARN into the Alexa endpoint!

### Update function

The below is ghetto, but it's easy, safe, and fast:

1. Run `sh pack.sh` in your CLI
2. Use the Lambda view in the AWS console (GUI) to upload your ZIP file
3. Click "Save"; it should deploy very quickly
4. Do your testing and repeat the above loop
