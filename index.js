"use strict";
const _ = require('lodash');
const log = console.log;
// Note: the below only works in newer Node, not the 4.x version AWS uses
// const { validator, checker } = require('./predicates');
const predicates = require('./predicates');
const validator = predicates.validator;
const checker = predicates.checker;

const alwaysTrue = ()=> true;
const getRandomNumberFromRange = (start, end)=>
{
	const range = end - start;
	let result = Math.random() * range;
	result += start;
	return Math.round(result);
};

const getErrorResponse = (errors)=>
{
    return {
        statusCode: '500',
        body: JSON.stringify({result: false, error: errors.join('\n')}),
        headers: {
            'Content-Type': 'application/json',
        }
    };
};

const getResponse = (data)=>
{
    return {
        statusCode: '200',
        body: JSON.stringify({result: true, data}),
        headers: {
            'Content-Type': 'application/json',
        }
    }
};

// predicate helpers
const eventHasStartAndEnd = (o) => _.has(o, 'start') && _.has(o, 'end');
const eventHasTestEcho    = (o) => _.get(o, 'echo', false);
const isLegitNumber       = (o) => _.isNumber(o) && _.isNaN(o) === false;

// argument predicates
const legitEvent = (o)=> 
    _.some([
            eventHasStartAndEnd, 
            eventHasTestEcho
        ],
        (predicate) => predicate(o)
    );
const legitStart = (o) => isLegitNumber(_.get(o, 'start'));
const legitEnd   = (o) => isLegitNumber(_.get(o, 'end'));

// validators
const validObject = validator('Not an Object.', _.isObjectLike);
const validEvent  = validator('Invalid event, missing key properties.', legitEvent);
const validStart  = validator('start is not a valid number.', legitStart);
const validEnd    = validator('end is not a valid number.', legitEnd);

// checkers
const checkEvent       = checker(validObject, validEvent);
const checkStartAndEnd = checker(validStart, validEnd);

const handler = (event, context, callback) =>
{
    if(_.isNil(callback) === true)
    {
        return getErrorResponse(['No callback was passed to the handler.']);
    }

    const errors = checkEvent(event);
    if(errors.length > 0)
    {
        callback(new Error(errors.join('\n')));
        return getErrorResponse(errors);
    }

    if(event.echo === true)
    {
        log("echo received.");
        const echoResponse = getResponse('pong');
        log("sending response:", echoResponse);
        callback(undefined, echoResponse);
        return echoResponse;
    }

    const startEndErrors = checkStartAndEnd(event);
    if(startEndErrors.length > 0)
    {
        callback(new Error(startEndErrors.join('\n')));
        return getErrorResponse(startEndErrors);
    }

    const start        = _.get(event, 'start');
    const end          = _.get(event, 'end');
    const randomNumber = getRandomNumberFromRange(start, end);
    const response     = getResponse(randomNumber);
    callback(undefined, randomNumber);
    return response;
};

module.exports = {
    alwaysTrue,
    getRandomNumberFromRange,
    handler
};