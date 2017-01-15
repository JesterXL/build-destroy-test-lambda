const expect = require("chai").expect;
const should = require('chai').should();
const _ = require('lodash');
const log = console.log;
const {
	listFunctions,
	createFunction,
	deleteFunction,
	getProgram,
	ACTION_NOTHING,
	ACTION_BUILD,
	ACTION_DESTROY,
	ACTION_DESTROY_AND_BUILD
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

describe.only('#getProgram', ()=>
{
	it('should not build with no parameters', ()=>
	{
		const program = getProgram();
		expect(program.action).to.equal(ACTION_NOTHING);
	});
	it('should build if we tell it to do so', ()=>
	{
		const parameters = [
			'node is rad',
			'testing bro',
			'--build'
		];
		const program = getProgram(parameters);
		expect(program.action).to.equal(ACTION_BUILD);
	});
	it('should destroy if we tell it to do so', ()=>
	{
		const parameters = [
			'node is rad',
			'testing bro',
			'--destroy'
		];
		const program = getProgram(parameters);
		expect(program.action).to.equal(ACTION_DESTROY);
	});
	it('should destroy and build', ()=>
	{
		const parameters = [
			'node is rad',
			'testing bro',
			'--destroy',
			'--build'
		];
		const program = getProgram(parameters);
		expect(program.action).to.equal(ACTION_DESTROY_AND_BUILD);
	});
});

