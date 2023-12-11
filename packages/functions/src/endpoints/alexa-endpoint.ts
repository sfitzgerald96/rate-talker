import { Rate, RateType } from '@my-sst-app/core/rate';
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
import moment from 'moment';

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

const ReadMortgageInsightsIntentHandler: RequestHandler = {
  canHandle(handlerInput: HandlerInput) : boolean {
    const request = handlerInput.requestEnvelope.request;  
    return request.type === 'IntentRequest'
      && request.intent.name === 'ReadMortgageInsights';
  },
  handle(handlerInput : HandlerInput) : Response {
    const speechText = 'Here is the article:';

    return handlerInput.responseBuilder
      .speak(speechText)
      .withSimpleCard('Here is the article:', speechText)
      .getResponse();
  },
};

const GetMortgageRatesIntentHandler : RequestHandler = {
  canHandle(handlerInput: HandlerInput) : boolean {
    const request = handlerInput.requestEnvelope.request;  
    return request.type === 'IntentRequest'
      && request.intent.name === 'GetMortgageRates';
  },
  async handle(handlerInput: HandlerInput) : Promise<Response> {
    let rateItem: RateType = JSON.parse(await Rate.findMostRecentlyAvailableRate())
    
    let speechText = ''
    if (rateItem.rateDate !== moment().format('MM/DD/YYYY')) {
      speechText = `Today's rates have not been recorded yet. Rates are typically posted on weekdays by 6pm ET. 
      However, I do have rates for ${rateItem.rateDate}, which are as follows:`
    }
    if (rateItem.thirtyYrFixedMortgage) {
      speechText += `Thirty year mortgage is ${rateItem.thirtyYrFixedMortgage}%.`
    }
    if (rateItem.fifteenYrFixedMortgage) {
      speechText += `Fifteen year mortgage is ${rateItem.fifteenYrFixedMortgage}%.`
    }
    if (rateItem.tenYrTreasury) {
      speechText += `Ten year treasury is ${rateItem.tenYrTreasury}%.`
    }
    if (rateItem.mortgageArticle && rateItem.mortgageArticleTitle) {
      speechText += `Mortgage Insights written by Matthew Graham is titled ${rateItem.mortgageArticle}. It reads: "${rateItem.mortgageArticle}`;
    }

    return handlerInput.responseBuilder
      .speak(speechText)
      .withSimpleCard(`The thirty year mortgage is ${rateItem.thirtyYrFixedMortgage}% and the fifteen year mortgage is ${rateItem.fifteenYrFixedMortgage}%...`, speechText)
      .getResponse();
  },
};

const HelpIntentHandler: RequestHandler = {
  canHandle(handlerInput: HandlerInput) : boolean {
    const request = handlerInput.requestEnvelope.request;    
    return request.type === 'IntentRequest'
      && request.intent.name === 'AMAZON.HelpIntent';
  },
  handle(handlerInput: HandlerInput) : Response {
    const speechText = 'You can ask me about mortgage rates!';

    return handlerInput.responseBuilder
      .speak(speechText)
      .reprompt(speechText)
      .withSimpleCard('You can ask me about mortgage rates!', speechText)
      .getResponse();
  },
};

const CancelAndStopIntentHandler : RequestHandler = {
  canHandle(handlerInput: HandlerInput) : boolean {
    const request = handlerInput.requestEnvelope.request;
    return request.type === 'IntentRequest'
      && (request.intent.name === 'AMAZON.CancelIntent'
         || request.intent.name === 'AMAZON.StopIntent');
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
  canHandle(handlerInput: HandlerInput) : boolean {
    const request = handlerInput.requestEnvelope.request;    
    return request.type === 'SessionEndedRequest';
  },
  handle(handlerInput : HandlerInput) : Response {
    console.log(`Session ended with reason: ${(handlerInput.requestEnvelope.request as SessionEndedRequest).reason}`);

    return handlerInput.responseBuilder.getResponse();
  },
};

const MyErrorHandler : ErrorHandler = {
  canHandle(handlerInput: HandlerInput, error : Error ) : boolean {
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

export const handler: Handler = async (event: any, context: any) => {
  const skillHandler = SkillBuilders.custom()
    .addRequestHandlers(
      LaunchRequestHandler,
      GetMortgageRatesIntentHandler,
      ReadMortgageInsightsIntentHandler,
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
