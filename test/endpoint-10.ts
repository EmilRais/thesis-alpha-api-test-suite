import * as chai from "chai";
const should = chai.should();

import { Db, MongoClient } from "mongodb";
import * as agent from "superagent";

describe("Endpoint 10 - POST /user/login/alpha-api", () => {
    let database: Db;

    before(() => {
        return MongoClient.connect("mongodb://localhost:27017/database")
            .then(db => database = db);
    });

    afterEach(() => {
       return database.dropDatabase();
    });

    after(() => {
        return database.close();
    });

    it("1. Findes ingen bruger med den angivne email skal endpointet returnere statussen Unauthorized og en fejlbesked.", () => {
        const credential = { email: "some@email.com", password: "some-password", type: "alpha-api" };
        return agent.post("localhost:3030/user/login/alpha-api").send(credential)
            .catch(error => error.response)
            .then(response => {
                response.status.should.equal(401);
                response.text.should.equal("Der findes ingen bruger med email: some@email.com");
            });
    });

    it("2. Findes ingen bruger med det angivne login skal endpointet returnere statussen Unauthorized og en fejlbesked.", () => {
        const credential = { email: "some@email.com", password: "some-password", type: "alpha-api" };
        const user = { _id: "some-id", email: "some@email.com", credential: { email: "some@email.com", password: "some-other-password", type: "alpha-api" } };
        return database.collection("Users").insert(user)
            .then(() => agent.post("localhost:3030/user/login/alpha-api").send(credential))
            .catch(error => error.response)
            .then(response => {
                response.status.should.equal(401);
                response.text.should.equal("Forkert kodeord");
            });
    });

    it("3. Findes en bruger med det angivne login skal endpointet returnere statussen OK og brugeren.", () => {
        const credential = { email: "some@email.com", password: "some-password", type: "alpha-api" };
        const user = { _id: "some-id", email: "some@email.com", credential: { email: "some@email.com", password: "some-password", type: "alpha-api" } };
        return database.collection("Users").insert(user)
            .then(() => agent.post("localhost:3030/user/login/alpha-api").send(credential))
            .catch(error => error.response)
            .then(response => {
                response.status.should.equal(200);
                response.body.should.deep.equal(user);
            });
    });

});
