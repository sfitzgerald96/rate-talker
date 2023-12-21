import { Rate, RateType } from '@my-sst-app/core/rate';
import {  RateAttrsToSpeech, RateSpeechGenerator } from '@my-sst-app/core/rate-speech-generator';
import { MortgageInsightsSpeechGenerator } from  '@my-sst-app/core/mortgage-insights-speech-generator'
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
    return request.type === 'LaunchRequest';
  },
  handle(handlerInput: HandlerInput) : Response {
    const speechText = 'Welcome to rate talker! Ask me about rates or ask me to read you the latest mortgage insights article!';

    const response = handlerInput.responseBuilder
      .speak(speechText)
      .reprompt(speechText)
      .withSimpleCard('Welcome!', speechText)
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
  async handle(handlerInput : HandlerInput) : Promise<Response> {
    let rateItem: RateType = JSON.parse(await Rate.findMostRecentlyAvailableArticle())
    const speechGenerator = new MortgageInsightsSpeechGenerator(rateItem);
    const speechText = speechGenerator.generateSpeech();

    return handlerInput.responseBuilder
      .speak(speechText)
      .withSimpleCard('Article:', speechText)
      .getResponse();
  },
};

const RatesOverviewHandler : RequestHandler = {
  canHandle(handlerInput: HandlerInput) : boolean {
    const request = handlerInput.requestEnvelope.request;  
    return request.type === 'IntentRequest'
      && request.intent.name === 'RatesOverview';
  },
  async handle(handlerInput: HandlerInput) : Promise<Response> {
    let rateItem: RateType = JSON.parse(await Rate.findMostRecentlyAvailableRate())

    const rateAttrsToSpeech: RateAttrsToSpeech[] = [
      { name: 'thirtyYrFixedMortgage', label: 'Thirty year mortgage' },
      { name: 'fifteenYrFixedMortgage', label: 'Fifteen year mortgage' },
      { name: 'tenYrTreasury', label: 'Ten year treasury' },
    ];
    const speechGenerator = new RateSpeechGenerator(rateItem, rateAttrsToSpeech);
    const speechText = speechGenerator.generateSpeech();

    return handlerInput.responseBuilder
      .speak(speechText)
      .withSimpleCard(`Today's Rates:`, speechText)
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
    const speechText = 'Ask me about rates or ask me to read you the latest mortgage insights article!';

    return handlerInput.responseBuilder
      .speak(speechText)
      .reprompt(speechText)
      .withSimpleCard('Ask me about rates!', speechText)
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

export const handler: Handler = async (event: any, context: any) => {
  const skillHandler = SkillBuilders.custom()
    .addRequestHandlers(
      RatesOverviewHandler,
      ReadMortgageInsightsIntentHandler,
      LaunchRequestHandler,
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
