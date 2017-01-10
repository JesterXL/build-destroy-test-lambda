const _ = require('lodash');

const validator = (errorCode, method)=>
{
	const valid = function(args)
	{
		return method.apply(method, arguments);
	};
	valid.errorCode = errorCode;
	return valid;
}

function checker()
{
	const validators = _.toArray(arguments);
	return (something)=>
	{
		return _.reduce(validators, (errors, checkerFunction)=>
		{
			if(checkerFunction(something))
			{
				return errors;
			}
			else
			{
				return _.chain(errors).push(checkerFunction.errorCode).value();
			}
		}, [])
	};
};

module.exports = {
	validator,
	checker
};