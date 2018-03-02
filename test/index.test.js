const request = require('supertest');
const chai = require('chai');

const assert = chai.assert;
const expect = chai.expect;

let server;

beforeEach(function() {
	server = require('../app/index.js');
});

afterEach(function() {
	server.close();
});


describe('HTTP GET', function() {
	it('Get / should redirect to blog server', function(done) {
		request(server).get('/')
			.expect(302, done);
	});
});