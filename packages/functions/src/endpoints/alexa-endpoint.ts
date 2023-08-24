import {
  ErrorHandler,
  HandlerInput,
  RequestHandler,
  SkillBuilders,
} from 'ask-sdk-core';
import {
  Response,
  SessionEndedRequest,
} from 'ask-sdk-model';
import { Handler } from 'aws-lambda';

const LaunchRequestHandler: RequestHandler = {
  canHandle(handlerInput: HandlerInput) : boolean {
    const request = handlerInput.requestEnvelope.request;
    // console.log("REQUEST", request)
    return request.type === 'LaunchRequest';
  },
  handle(handlerInput: HandlerInput) : Response {
    const speechText = 'Welcome to your rate talker skill. Ask me about mortgage rates!';

    const response = handlerInput.responseBuilder
      .speak(speechText)
      .reprompt(speechText)
      .withSimpleCard('Welcome to your rate talker skill. Ask me about mortgage rates!', speechText)
      .getResponse();
    return response
  },
};

const AskWeatherIntentHandler : RequestHandler = {
  canHandle(handlerInput : HandlerInput) : boolean {
    const request = handlerInput.requestEnvelope.request;  
    return request.type === 'IntentRequest'
      && request.intent.name === 'AskWeatherIntent';
  },
  handle(handlerInput : HandlerInput) : Response {
    const speechText = 'The weather today is sunny.';

    console.log(speechText)
    return handlerInput.responseBuilder
      .speak(speechText)
      .withSimpleCard('The weather today is sunny.', speechText)
      .getResponse();
  },
};

const HelpIntentHandler : RequestHandler = {
  canHandle(handlerInput : HandlerInput) : boolean {
    const request = handlerInput.requestEnvelope.request;    
    return request.type === 'IntentRequest'
      && request.intent.name === 'AMAZON.HelpIntent';
  },
  handle(handlerInput : HandlerInput) : Response {
    const speechText = 'You can ask me the weather!';

    return handlerInput.responseBuilder
      .speak(speechText)
      .reprompt(speechText)
      .withSimpleCard('You can ask me the weather!', speechText)
      .getResponse();
  },
};

const CancelAndStopIntentHandler : RequestHandler = {
  canHandle(handlerInput : HandlerInput) : boolean {
    const request = handlerInput.requestEnvelope.request;
    return request.type === 'IntentRequest'
      && (request.intent.name === 'AMAZON.CancelIntent'
         || request.intent.name === 'AMAZON.StopIntent'
         || request.intent.name === "AMAZON.NavigateHomeIntent"
         || request.intent.name === "AMAZON.FallbackIntent");

  },
  handle(handlerInput : HandlerInput) : Response {
    const speechText = 'Goodbye!';

    return handlerInput.responseBuilder
      .speak(speechText)
      .withSimpleCard('Goodbye!', speechText)
      .withShouldEndSession(true)      
      .getResponse();
  },
};

const SessionEndedRequestHandler : RequestHandler = {
  canHandle(handlerInput : HandlerInput) : boolean {
    const request = handlerInput.requestEnvelope.request;    
    return request.type === 'SessionEndedRequest';
  },
  handle(handlerInput : HandlerInput) : Response {
    console.log(`Session ended with reason: ${(handlerInput.requestEnvelope.request as SessionEndedRequest).reason}`);

    return handlerInput.responseBuilder.getResponse();
  },
};

const MyErrorHandler : ErrorHandler = {
  canHandle(handlerInput : HandlerInput, error : Error ) : boolean {
    return true;
  },
  handle(handlerInput : HandlerInput, error : Error) : Response {
    console.log(`Error handled: ${error.message}`);

    return handlerInput.responseBuilder
      .speak('Sorry, I don\'t understand your command. Please say it again.')
      .reprompt('Sorry, I don\'t understand your command. Please say it again.')
      .getResponse();
  }
};

// export const handler: Handler = async (event, context) => {
//   console.log("WHERE ARE YOU RUNNING")
//   console.log('EVENT: \n' + JSON.stringify(event, null, 2));
//   return "WHERE ARE YOU RUNNING";
// };

// export const handler = SkillBuilders.custom()
//   .addRequestHandlers(
//     LaunchRequestHandler,
//     AskWeatherIntentHandler,
//     HelpIntentHandler,
//     CancelAndStopIntentHandler,
//     SessionEndedRequestHandler,
//   )
//   .addErrorHandlers(MyErrorHandler)
//   .lambda();

export const handler = async (event: any, context: any) => {
  const skillHandler = SkillBuilders.custom()
    .addRequestHandlers(
      LaunchRequestHandler,
      AskWeatherIntentHandler,
      HelpIntentHandler,
      CancelAndStopIntentHandler,
      SessionEndedRequestHandler
    )
    .addErrorHandlers(MyErrorHandler)
    .lambda();

  return new Promise((resolve, reject) => {
    skillHandler(event, context, (err, response) => {
      if (err) {
        reject(err);
      } else {
        resolve(response);
      }
    });
  });
};
