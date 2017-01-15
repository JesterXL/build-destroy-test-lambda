const log      = console.log;
const AWS      = require('aws-sdk');
AWS.config.loadFromPath('./credentials.json');
const lambda   = new AWS.Lambda();
const fs       = require('fs');
const _        = require('lodash');

const ACTION_NOTHING           = 'nothing';
const ACTION_BUILD             = 'build';
const ACTION_DESTROY           = 'destroy';
const ACTION_DESTROY_AND_BUILD = 'destroy and build';

const hasBigBuild   = (array) => _.includes(array, '--build');
const hasSmallBuild = (array) => _.includes(array, '-b');
const hasBuild      = (array) => hasBigBuild(array) || hasSmallBuild(array);

const hasBigDestroy   = (array) => _.includes(array, '--destroy');
const hasSmallDestroy = (array) => _.includes(array, '-d');
const hasDestroy      = (array) => hasBigDestroy(array) || hasSmallDestroy(array);

const hasDestroyAndBuild = (array) => hasBuild(array) && hasDestroy(array);

const getProgram = (argsv)=>
{
    if(_.isArray(argsv) === false)
    {
        return {action: ACTION_NOTHING};
    }

    if(hasDestroyAndBuild(argsv) === true)
    {
        return {action: ACTION_DESTROY_AND_BUILD};
    }

    if(hasBuild(argsv) === true)
    {
        return {action: ACTION_BUILD};
    }

    if(hasDestroy(argsv) === true)
    {
        return {action: ACTION_DESTROY};
    }

    return {action: ACTION_NOTHING};
};

const performActionIfPassed = (callback)=>
{
    const program = getProgram(process.argv);
    if(program.action === ACTION_BUILD)
    {
        createFunction(lambda, fs, callback);
    }
    else if(program.action === ACTION_DESTROY)
    {
        deleteFunction(lambda, callback);
    }
    else if(program.action === ACTION_DESTROY_AND_BUILD)
    {
        deleteFunction(lambda, (err, data)=>
        {
            createFunction(lambda, fs, callback);
        });
    }
};

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
    log("Create function...");
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
            console.log("err:", err);
            return callback(err);
        }
        log("data:", data);
        callback(undefined, data);
    });
};

const deleteFunction = (lambda, callback)=>
{
    log("Delete function...");
    var params = {
        FunctionName: FUNCTION_NAME
    };
    lambda.deleteFunction(params, (err, data)=>
    {
        if(err)
        {
            log("lambda::deleteFunction, error:", err);
            return callback(err);
        }
        log("lambda::deleteFunction, data:", data);
        callback(undefined, data);
    });
};

if(require.main === module)
{
    performActionIfPassed((err, data)=>
    {
        log("Done.");  
    });
}

module.exports = {
    listFunctions,
    createFunction,
    deleteFunction,
    getProgram,
    ACTION_BUILD,
    ACTION_DESTROY,
    ACTION_NOTHING,
    ACTION_DESTROY_AND_BUILD
};

// log(process.argv);