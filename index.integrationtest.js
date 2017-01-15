const AWS      = require('aws-sdk');
AWS.config.loadFromPath('./credentials.json');
const lambda   = new AWS.Lambda();
const log = console.log;

const expect = require("chai").expect;
const should = require('chai').should();
const {
    handler
} = require('./index');


describe('#index integration', function()
{
    this.timeout(10 * 1000);

    describe('#echo', ()=>
    {
        it('responds to an echo', (done)=>
        {
            var params = {
                FunctionName: "datDJMicrodev", 
                Payload: JSON.stringify({echo: true})
            };
            lambda.invoke(params, (err, data)=>
            {
                log("err:", err);
                log("data:", data);
                done(err);
            });
        });
    });
});
