import * as chai from "chai";
const should = chai.should();

import { Db, MongoClient } from "mongodb";
import * as agent from "superagent";

describe("Endpoint 8 - POST /user/create/alpha-api", () => {
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

    it("1. Er brugeren ugyldig skal endpointet returnere Bad Request.", () => {
        const user = { email: "some-invalid-email", credential: "some-invalid-credential" };
        return agent.post("localhost:3030/user/create/alpha-api")
            .send(user)
            .catch(error => error.response)
            .then(response => {
                response.status.should.equal(400);
            });
    });

    it("2. Er brugeren gyldig skal endpointet returnere Created og den gemte bruger.", () => {
        const user = {
            email: "some@email.com",
            credential: { type: "alpha-api", email: "some@mail.com", password: "some-password" }
        };
        return agent.post("localhost:3030/user/create/alpha-api")
            .send(user)
            .catch(error => error.response)
            .then(response => {
                response.status.should.equal(201);

                response.body._id.should.be.a.string;
                delete response.body._id;

                response.body.should.deep.equal(user);
            });
    });

    it("3. Er brugeren gyldig skal den efterfølgende findes i Users.", () => {
        const user = {
            email: "some@email.com",
            credential: { type: "alpha-api", email: "some@mail.com", password: "some-password" }
        };
        return agent.post("localhost:3030/user/create/alpha-api")
            .send(user)
            .then(() => {
                return database.collection("Users").find({}, { _id: false }).toArray()
                    .then(users => {
                        users.should.deep.equal([user]);
                    });
            });
    });

});
