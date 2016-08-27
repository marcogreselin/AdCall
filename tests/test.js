// var expect = require('chai').expect;
var request = require('supertest');
var app = require('../app');

describe("a route", function() {
    it("is accessible", function(done) {
        request(app)
            .get("/")
            .expect(200, done);
    });
});