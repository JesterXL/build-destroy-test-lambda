const expect = require("chai").expect;
const should = require('chai').should();
const _ = require('lodash');
const {
	listFunctions,
	createFunction,
	deleteFunction
} = require('./build');

const mockLamba = {
	listFunctions: (params, cb) => cb(undefined, {"Functions": []}),
	createFunction: (params, cb) => cb(undefined, {"FunctionArn": 'default'}),
	deleteFunction: (params, cb) => cb(undefined, {})
};
const mockBadLambda = {
	listFunctions: (params, cb) => cb(new Error('boom')),
	createFunction: (params, cb) => cb(new Error('boom')),
	deleteFunction: (params, cb) => cb(new Error('boom'))
};

describe('#listFunctions', ()=>
{
	it('should give a list of functions', (done)=>
	{
		listFunctions(mockLamba, (err, data)=>
		{
			_.isArray(data.Functions).should.be.true;
			done();
		});
	});
	it('should blow up if something goes wrong', (done)=>
	{
		listFunctions(mockBadLambda, (err, data)=>
		{
			err.should.exist;
			done();
		});
	});
});

const legitString = (o) => _.isString(o) && o.length > 0;
const mockFS = {
	readFileSync: (filename)=> new Buffer('')
};
describe('#createFunction', ()=>
{
	it('should give us a positive response', (done)=>
	{
		createFunction(mockLamba, mockFS, (err, data)=>
		{
			legitString(data.FunctionArn).should.be.true;
			done();
		});
	});
	it('should blow up if something goes wrong', (done)=>
	{
		createFunction(mockBadLambda, mockFS, (err, data)=>
		{
			err.should.exist;
			done();
		});
	});
});

describe('#deleteFunction', ()=>
{
	it('should delete our lambda if there', (done)=>
	{
		deleteFunction(mockLamba, (err)=>
		{
			_.isUndefined(err).should.be.true;
			done();
		});
	});
	it('should not delete our lambda if it', (done)=>
	{
		deleteFunction(mockBadLambda, (err)=>
		{
			err.should.exist;
			done();
		});
	});
});

