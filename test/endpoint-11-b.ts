import * as chai from "chai";
const should = chai.should();

import { Db, MongoClient } from "mongodb";
import * as agent from "superagent";

describe("Endpoint 11B - POST /user/facebook/extend-token", () => {
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

    it("should return unauthorized when token is invalid", () => {
        const credential = { type: "facebook", userId: userId, token: "some-invalid-token" };
        return agent.post("localhost:3030/user/facebook/extend-token")
            .send(credential)
            .catch(error => error.response)
            .then(response => {
                response.status.should.equal(401);
                response.text.should.equal("Ugyldigt Facebook-login");
            });
    });

    it("should return internal server error when the database fails", () => {
        const credential = { type: "facebook", userId: userId, token: userToken };

        return database.executeDbAdminCommand({ configureFailPoint: "throwSockExcep", mode: { times: 2 } })
            .catch(() => {})
            .then(() => {
                return agent.post("localhost:3030/user/facebook/extend-token")
                    .send(credential)
                    .catch(error => error.response)
                    .then(response => {
                        response.status.should.equal(500);
                    });
            });
    });

    it("should return not acceptable when no user owns the token", () => {
        const credential = { type: "facebook", userId: userId, token: userToken };
        return agent.post("localhost:3030/user/facebook/extend-token")
            .send(credential)
            .catch(error => error.response)
            .then(response => {
                response.status.should.equal(406);
                response.text.should.equal("Bruger ikke oprettet");
            });
    });

    it("should return 200 when user owns the token", () => {
        const credential = { type: "facebook", userId: userId, token: userToken };

        const user = {
            _id: "some-id",
            credential: { type: "facebook", userId: userId }
        };
        return database.collection("Users").insert(user)
            .then(() => {
                return agent.post("localhost:3030/user/facebook/extend-token")
                    .send(credential)
                    .catch(error => error.response)
                    .then(response => {
                        response.status.should.equal(200);
                    });
            });
    });

    it("should return the long-lasting token when user owns the token", () => {
        const credential = { type: "facebook", userId: userId, token: userToken };

        const user = {
            _id: "some-id",
            email: null as string,
            credential: { type: "facebook", userId: userId, token: null as string }
        };
        return database.collection("Users").insert(user)
            .then(() => {
                return agent.post("localhost:3030/user/facebook/extend-token")
                    .send(credential)
                    .catch(error => error.response)
                    .then(response => {
                        response.text.should.be.a.string;
                        response.text.length.should.be.greaterThan(160);
                        response.text.length.should.be.lessThan(200);
                    });
            });
    });

});
