import * as chai from "chai";
const should = chai.should();

import { Db, MongoClient } from "mongodb";
import * as agent from "superagent";

describe("Endpoint 9 - POST /user/create/facebook", () => {
    let database: Db;
    let userId: string;
    let userToken: string;

    before(() => {
        return MongoClient.connect("mongodb://localhost:27017/database")
            .then(db => database = db)
            .then(() => {
                return agent.get("https://graph.facebook.com/1092068880930122/accounts/test-users")
                    .query({ access_token: "1092068880930122|470f440e050eb59788e7178c86ca982f" })
                    .then(response => {
                        const data = JSON.parse(response.text).data[0];
                        userId = data.id;
                        userToken = data.access_token;
                    });
            });
    });

    afterEach(() => {
       return database.dropDatabase();
    });

    after(() => {
        return database.close();
    });

    it("1. Repræsenterer inputtet ikke en gyldig Facebook-bruger skal endpointet returnere statussen Bad Request og en fejlbesked.", () => {
        const credential = { type: "alpha-api", email: "some@email.dk", password: "some-password" };
        const user = { email: "some@email.dk", credential: credential };

        return agent.post("localhost:3030/user/create/facebook")
            .send(user)
            .catch(error => error.response)
            .then(response => {
                response.status.should.equal(400);
                response.text.should.equal("Ugyldigt Facebook-login");
            });
    });

    it("2. Er Facebook-brugerens token ugyldig skal endpointet returnere statussen Bad Request og en fejlbesked.", () => {
        const credential = { type: "facebook", userId: "some-user-id", token: "some-token" };
        const user = { email: "some@email.dk", credential: credential };

        return agent.post("localhost:3030/user/create/facebook")
            .send(user)
            .catch(error => error.response)
            .then(response => {
                response.status.should.equal(400);
                response.text.should.equal("Ugyldigt Facebook-login");
            });
    });

    it("3. Er Facebook-brugerens token gyldig skal endpointet returnere statussen Created og den oprettede bruger.", () => {
        const credential = { type: "facebook", userId: userId, token: userToken };
        const user = { email: "some@email.dk", credential: credential };

        return agent.post("localhost:3030/user/create/facebook")
            .send(user)
            .catch(error => error.response)
            .then(response => {
                response.status.should.equal(201);

                response.body._id.should.be.a.string;
                delete response.body._id;

                response.body.credential.token.should.be.a.string;
                response.body.credential.token = credential.token;

                response.body.should.deep.equal(user);
            });
    });

    it("4. Er Facebook-brugerens token gyldig skal brugeren efterfølgende findes i databasen.", () => {
        const credential = { type: "facebook", userId: userId, token: userToken };
        const user = { email: "some@email.dk", credential: credential };

        return agent.post("localhost:3030/user/create/facebook")
            .send(user)
            .catch(error => error.response)
            .then(response => {
                return database.collection("Users").findOne({ email: "some@email.dk" })
                    .then(storedUser => should.exist(storedUser));
            });
    });

});
