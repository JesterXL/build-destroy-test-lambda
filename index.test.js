const expect = require("chai").expect;
const should = require('chai').should();
const _ = require('lodash');
const {
	alwaysTrue,
    getRandomNumberFromRange,
    handler
} = require('./index');

const responseLike = (o)=> _.isObjectLike(o) && _.has(o, 'statusCode') && _.has(o, 'body');
const responseSucceeded = (o)=>
{
    const body = JSON.parse(o.body);
    return body.result === true;
};

describe('#index', ()=>
{
    describe('#alwaysTrue', ()=>
    {
        it('is always true', ()=>
        {
            alwaysTrue().should.be.true;
        });
    });
    describe('#getRandomNumberFromRange', ()=>
    {
        it('should give a number within an expected range', ()=>
        {
            const START = 1;
            const END = 10;
            const result = getRandomNumberFromRange(START, END);
            _.inRange(result, START, END).should.be.true;
        });
    });
    describe('#handler', ()=>
    {
        it('returns a response with basic inputs', ()=>
        {
            const response = handler({}, {}, ()=>{});
            responseLike(response).should.be.true;
        });
        it('passing nothing is ok', ()=>
        {
            const response = handler();
            responseLike(response).should.be.true;
        });
        it('succeeds if event has a start and end', ()=>
        {
            const response = handler({start: 1, end: 10}, {}, ()=>{});
            responseSucceeded(response).should.be.true;
        });
        it('fails if event only has start', ()=>
        {
            const response = handler({start: 1}, {}, ()=>{});
            responseSucceeded(response).should.be.false;
        });
        it('succeeds if event only has echo to true', ()=>
        {
            const response = handler({echo: true}, {}, ()=>{});
            responseSucceeded(response).should.be.true;
        });
    });
});
