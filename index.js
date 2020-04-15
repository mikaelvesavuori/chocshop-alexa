const Alexa = require("ask-sdk-core");
const fetch = require("node-fetch");

const BASE_URL = "https://chocshop.mikaelvesavuori.workers.dev";

const WELCOME_STATEMENT = "Welcome to ChocShop. How can I help you?";
const HELP_STATEMENT =
  "How can I help? Maybe your curious about our products, what we have in stock at the moment, or our opening hours?";
const GOODBYE_STATEMENT = "Goodbye!";
const ERROR_STATEMENT =
  "Sorry, I had trouble doing what you asked. Please try again.";

const GET_OPENING_HOURS_RESPONSE =
  "We are open between 8 am and 6 pm Monday to Friday, and from 10 am to 4 pm on the Weekends.";
const GET_PRODUCTS_RESPONSE =
  "We offer chocolate bars, cakes, gift boxes, ice cream, brownies and pralines. They're sure to be your new favorites!";

/*********************/
/*      HELPERS      */
/*********************/

// From: http://alexa.codegenerator.s3-website-us-east-1.amazonaws.com
function getSlotValues(filledSlots) {
  const slotValues = {};

  Object.keys(filledSlots).forEach((item) => {
    const name = filledSlots[item].name;

    if (
      filledSlots[item] &&
      filledSlots[item].resolutions &&
      filledSlots[item].resolutions.resolutionsPerAuthority[0] &&
      filledSlots[item].resolutions.resolutionsPerAuthority[0].status &&
      filledSlots[item].resolutions.resolutionsPerAuthority[0].status.code
    ) {
      switch (
        filledSlots[item].resolutions.resolutionsPerAuthority[0].status.code
      ) {
        case "ER_SUCCESS_MATCH":
          slotValues[name] = {
            heardAs: filledSlots[item].value,
            resolved:
              filledSlots[item].resolutions.resolutionsPerAuthority[0].values[0]
                .value.name,
            ERstatus: "ER_SUCCESS_MATCH",
          };
          break;
        case "ER_SUCCESS_NO_MATCH":
          slotValues[name] = {
            heardAs: filledSlots[item].value,
            resolved: "",
            ERstatus: "ER_SUCCESS_NO_MATCH",
          };
          break;
        default:
          break;
      }
    } else {
      slotValues[name] = {
        heardAs: filledSlots[item].value || "", // may be null
        resolved: "",
        ERstatus: "",
      };
    }
  }, this);

  return slotValues;
}

// This matches the synonyms that Alexa has been taught
const bar = [
  "bar",
  "chocolate bars",
  "white chocolate",
  "milk chocolate",
  "chocolate bar",
  "chocolate",
  "piece of chocolate",
  "stick",
  "bar",
  "choco bar",
];

const box = ["gift box", "gift_boxes", "chocolate box", "box"];

const brownie = ["brownies", "brownie cake", "brownie"];

const cake = [
  "cake",
  "cake",
  "pastry",
  "sponge cake",
  "pastries",
  "cakes",
  "chocolate cake",
  "dessert",
];

const icecream = ["ice cream", "chocolate ice cream"];

const pralines = [
  "pralines",
  "chocolate pieces",
  "chocolate pralines",
  "pieces",
  "chocolates",
];

function fuzzyMatch(heardName) {
  let product = null;

  if (bar.includes(heardName)) {
    console.log(`${heardName} is part of 'bar'`);
    product = "bar";
  } else if (box.includes(heardName)) {
    console.log(`${heardName} is part of 'box'`);
    product = "box";
  } else if (brownie.includes(heardName)) {
    console.log(`${heardName} is part of 'brownie'`);
    product = "brownie";
  } else if (cake.includes(heardName)) {
    console.log(`${heardName} is part of 'cake'`);
    product = "cake";
  } else if (icecream.includes(heardName)) {
    console.log(`${heardName} is part of 'icecream'`);
    product = "icecream";
  } else if (pralines.includes(heardName)) {
    console.log(`${heardName} is part of 'pralines'`);
    product = "pralines";
  } else {
    console.error(`Could not match '${heardName}' to any product!`);
  }

  return product;
}

/*
function stripSpeak(str) {
  return str.replace("<speak>", "").replace("</speak>", "");
}

function getPreviousSpeechOutput(attrs) {
  if (attrs.lastSpeechOutput && attrs.history.length > 1) {
    return attrs.lastSpeechOutput;
  } else {
    return false;
  }
}
*/

/*********************/
/*  CUSTOM HANDLERS  */
/*********************/

const GetOpeningHours_IntentHandler = {
  canHandle(handlerInput) {
    return (
      Alexa.getRequestType(handlerInput.requestEnvelope) === "IntentRequest" &&
      Alexa.getIntentName(handlerInput.requestEnvelope) === "GetOpeningHours"
    );
  },
  handle(handlerInput) {
    return handlerInput.responseBuilder
      .speak(GET_OPENING_HOURS_RESPONSE)
      .withSimpleCard("ChocShop opening hours", GET_OPENING_HOURS_RESPONSE)
      .reprompt("")
      .getResponse();
  },
};

const GetProducts_IntentHandler = {
  canHandle(handlerInput) {
    return (
      Alexa.getRequestType(handlerInput.requestEnvelope) === "IntentRequest" &&
      Alexa.getIntentName(handlerInput.requestEnvelope) === "GetProducts"
    );
  },
  handle(handlerInput) {
    return handlerInput.responseBuilder
      .speak(GET_PRODUCTS_RESPONSE)
      .withSimpleCard("ChocShop products", GET_PRODUCTS_RESPONSE)
      .reprompt("")
      .getResponse();
  },
};

const GetProductStockStatus_IntentHandler = {
  canHandle(handlerInput) {
    return (
      Alexa.getRequestType(handlerInput.requestEnvelope) === "IntentRequest" &&
      Alexa.getIntentName(handlerInput.requestEnvelope) ===
        "GetProductStockStatus"
    );
  },
  async handle(handlerInput) {
    let say = "";
    const request = handlerInput.requestEnvelope.request;
    const slotValues = getSlotValues(request.intent.slots);

    if (slotValues && slotValues.product) {
      const PRODUCT_HEARD_AS = slotValues.product.heardAs;
      const FIXED_PRODUCT_NAME = fuzzyMatch(PRODUCT_HEARD_AS);

      const URL = `${BASE_URL}/?item=${FIXED_PRODUCT_NAME}`;
      const DATA = await fetch(URL).then(async (data) => data.json());
      const IN_STOCK = DATA.inStock ? "in stock" : "currently not in stock";

      say = `${PRODUCT_HEARD_AS} is ${IN_STOCK}`;
    }

    return handlerInput.responseBuilder
      .speak(say)
      .withSimpleCard("ChocShop product availability", say)
      .reprompt("")
      .getResponse();
  },
};

const GetProductPrice_IntentHandler = {
  canHandle(handlerInput) {
    return (
      Alexa.getRequestType(handlerInput.requestEnvelope) === "IntentRequest" &&
      Alexa.getIntentName(handlerInput.requestEnvelope) === "GetProductPrice"
    );
  },
  async handle(handlerInput) {
    let say = "";
    const request = handlerInput.requestEnvelope.request;
    const slotValues = getSlotValues(request.intent.slots);

    if (slotValues && slotValues.product) {
      const PRODUCT_HEARD_AS = slotValues.product.heardAs;
      const FIXED_PRODUCT_NAME = fuzzyMatch(PRODUCT_HEARD_AS);

      const URL = `${BASE_URL}/?item=${FIXED_PRODUCT_NAME}`;
      const DATA = await fetch(URL).then(async (data) => data.json());
      const PRICE = DATA.price;

      say = `The price of ${PRODUCT_HEARD_AS} is $${PRICE}`;
    }

    return handlerInput.responseBuilder
      .speak(say)
      .withSimpleCard("Prices at ChocShop", say)
      .reprompt("")
      .getResponse();
  },
};

/*********************/
/* STANDARD HANDLERS */
/*********************/

const Launch_RequestHandler = {
  canHandle(handlerInput) {
    return (
      Alexa.getRequestType(handlerInput.requestEnvelope) === "LaunchRequest"
    );
  },
  handle(handlerInput) {
    const speakOutput = WELCOME_STATEMENT;
    return handlerInput.responseBuilder
      .speak(speakOutput)
      .reprompt(speakOutput)
      .getResponse();
  },
};

const Help_IntentHandler = {
  canHandle(handlerInput) {
    return (
      Alexa.getRequestType(handlerInput.requestEnvelope) === "IntentRequest" &&
      Alexa.getIntentName(handlerInput.requestEnvelope) === "AMAZON.HelpIntent"
    );
  },
  handle(handlerInput) {
    const speakOutput = HELP_STATEMENT;

    return handlerInput.responseBuilder
      .speak(speakOutput)
      .reprompt(speakOutput)
      .getResponse();
  },
};

const CancelAndStop_IntentHandler = {
  canHandle(handlerInput) {
    return (
      Alexa.getRequestType(handlerInput.requestEnvelope) === "IntentRequest" &&
      (Alexa.getIntentName(handlerInput.requestEnvelope) ===
        "AMAZON.CancelIntent" ||
        Alexa.getIntentName(handlerInput.requestEnvelope) ===
          "AMAZON.StopIntent")
    );
  },
  handle(handlerInput) {
    const speakOutput = GOODBYE_STATEMENT;
    return handlerInput.responseBuilder.speak(speakOutput).getResponse();
  },
};

const SessionEnded_RequestHandler = {
  canHandle(handlerInput) {
    return (
      Alexa.getRequestType(handlerInput.requestEnvelope) ===
      "SessionEndedRequest"
    );
  },
  handle(handlerInput) {
    // Any cleanup logic goes here.
    return handlerInput.responseBuilder.getResponse();
  },
};

const Fallback_IntentHandler = {
  canHandle(handlerInput) {
    const request = handlerInput.requestEnvelope.request;
    return (
      request.type === "IntentRequest" &&
      request.intent.name === "AMAZON.FallbackIntent"
    );
  },
  handle(handlerInput) {
    //const request = handlerInput.requestEnvelope.request;
    const responseBuilder = handlerInput.responseBuilder;
    //let sessionAttributes = handlerInput.attributesManager.getSessionAttributes();
    //let previousSpeech = getPreviousSpeechOutput(sessionAttributes);

    return responseBuilder
      .speak("Sorry I didnt catch what you said")
      .reprompt("reprompt")
      .getResponse();
  },
};

// Generic error handling to capture any syntax or routing errors. If you receive an error
// stating the request handler chain is not found, you have not implemented a handler for
// the intent being invoked or included it in the skill builder below.
const ErrorHandler = {
  canHandle() {
    return true;
  },
  handle(handlerInput, error) {
    console.log(`~~~~ Error handled: ${error.stack}`);
    const speakOutput = ERROR_STATEMENT;

    return handlerInput.responseBuilder
      .speak(speakOutput)
      .reprompt(speakOutput)
      .getResponse();
  },
};

// The intent reflector is used for interaction model testing and debugging.
// It will simply repeat the intent the user said. You can create custom handlers
// for your intents by defining them above, then also adding them to the request
// handler chain below.
const IntentReflectorHandler = {
  canHandle(handlerInput) {
    return (
      Alexa.getRequestType(handlerInput.requestEnvelope) === "IntentRequest"
    );
  },
  handle(handlerInput) {
    const intentName = Alexa.getIntentName(handlerInput.requestEnvelope);
    const speakOutput = `You just triggered ${intentName}`;

    return (
      handlerInput.responseBuilder
        .speak(speakOutput)
        //.reprompt('')
        .getResponse()
    );
  },
};

// The SkillBuilder acts as the entry point for your skill, routing all request and response
// payloads to the handlers above. Make sure any new handlers or interceptors you've
// defined are included below. The order matters - they're processed top to bottom.
exports.handler = Alexa.SkillBuilders.custom()
  .addRequestHandlers(
    Launch_RequestHandler,
    GetOpeningHours_IntentHandler,
    GetProducts_IntentHandler,
    GetProductStockStatus_IntentHandler,
    GetProductPrice_IntentHandler,
    Help_IntentHandler,
    CancelAndStop_IntentHandler,
    Fallback_IntentHandler,
    SessionEnded_RequestHandler,
    IntentReflectorHandler // make sure IntentReflectorHandler is last so it doesn't override your custom intent handlers
  )
  .addErrorHandlers(ErrorHandler)
  .lambda();
