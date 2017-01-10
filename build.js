const log      = console.log;
const AWS      = require('aws-sdk');
AWS.config.loadFromPath('./credentials.json');
const lambda   = new AWS.Lambda();
const fs       = require('fs');
const _        = require('lodash');

const listFunctions = (lambda, callback)=>
{
    var params = {
        MaxItems: 50
    };
    lambda.listFunctions(params, (err, data)=>
    {
        if(err)
        {
            // log("lambda::listFunctions error:", err);
            return callback(err);
        }
        // log("lambda::listFunctions, data:", data);
        callback(undefined, data);
    });
};

const NAME_PREFIX         = 'datDJMicro';
const QUALIFIER           = 'defaultalias';
const DEFAULT_ENVIRONMENT = 'dev';
const FUNCTION_NAME       = NAME_PREFIX + DEFAULT_ENVIRONMENT;
const ROLE                = 'arn:aws:iam::089724945947:role/lambda_basic_execution';

const createFunction = (lambda, fs, callback)=>
{
    var params = {
        Code: {
            ZipFile: fs.readFileSync('deploy.zip')
        },
        FunctionName: FUNCTION_NAME,
        Handler: 'index.handler',
        Role: ROLE,
        Runtime: 'nodejs4.3'
    };
    lambda.createFunction(params, (err, data)=>
    {
        if(err)
        {
            // console.log("err:", err);
            return callback(err);
        }
        // log("data:", data);
        callback(undefined, data);
    });
};

const deleteFunction = (lambda, callback)=>
{
    var params = {
        FunctionName: FUNCTION_NAME
    };
    lambda.deleteFunction(params, (err, data)=>
    {
        if(err)
        {
            // log("lambda::deleteFunction, error:", err);
            return callback(err);
        }
        // log("lambda::deleteFunction, data:", data);
        callback(undefined, data);
    });
};


// if (require.main === module)
// {
//     performActionIfPassed(process.argv);
// }

module.exports = {
    listFunctions,
    createFunction,
    deleteFunction
};

// createFunction(lambda, fs, (err, data)=>
// {
//     log("err:", err);
//     log("data:", data);
// });
// deleteFunction(lambda, (a, b)=>{
//     log("a:", a);
//     log("b:", b);
// });