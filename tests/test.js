var expect = require('chai').expect;
var request = require('supertest');
var app = require('../app');

describe("an api endpoint", function() {
    it("returns some sort of json", function(done) {
        request(app)
            .get("/")
            .expect(200, done);
    });
});