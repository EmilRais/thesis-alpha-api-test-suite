import * as chai from "chai";
const should = chai.should();

import { Db, MongoClient } from "mongodb";
import * as agent from "superagent";

describe("Endpoint 5 - POST /post/delete", () => {
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

    it("1. Lykkes det ikke at slette opslaget skal endpointet returnere Internal Server Error.", () => {
        const post = { _id: "some-id" };
        return agent.post("localhost:3030/post/delete").type("json")
            .send(post._id)
            .catch(error => error.response)
            .then(response => {
                response.status.should.equal(500);
            });
    });

    it("2. Lykkes det at slette opslaget skal endpointet returnere statussen OK.", () => {
        const post = { _id: "some-id" };
        return database.collection("Posts").insert(post)
            .then(() => {
                return agent.post("localhost:3030/post/delete").type("json")
                    .send(post._id)
                    .catch(error => error.response)
                    .then(response => {
                        response.status.should.equal(200);
                    });
            });
    });

    it("3. Lykkes det at slette opslaget forefindes opslaget ikke i databasen.", () => {
        const post = { _id: "some-id" };
        return database.collection("Posts").insert(post)
            .then(() => {
                return agent.post("localhost:3030/post/delete").type("json")
                    .send(post._id)
                    .catch(error => error.response)
                    .then(response => {
                        return database.collection("Posts").find().toArray()
                            .then(posts => posts.should.deep.equal([]));
                    });
            });
    });

});
