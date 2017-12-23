import * as chai from "chai";
const should = chai.should();

import { Db, MongoClient } from "mongodb";
import * as agent from "superagent";

describe("Endpoint 4 - POST /post/update", () => {
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

    it("1. Lykkes det ikke at opdatere opslaget skal endpointet returnere Internal Server Error.", () => {
        const post = { _id: "some-id", title: "some-title"};
        return agent.post("localhost:3030/post/update")
            .send(post)
            .catch(error => error.response)
            .then(response => {
                response.status.should.equal(500);
            });
    });

    it("2. Lykkes det at opdatere opslaget skal endpointet returnere statussen OK.", () => {
        const oldPost = { _id: "some-id", title: "old-title" };
        const newPost = { _id: "some-id", title: "new-title" };
        return database.collection("Posts").insert(oldPost)
            .then(() => {
                return agent.post("localhost:3030/post/update")
                    .send(newPost)
                    .catch(error => error.response)
                    .then(response => {
                        response.status.should.equal(200);
                    });
            });
    });

    it("3. Lykkes det at opdatere opslaget forefindes det opdaterede opslag i databasen.", () => {
        const oldPost = {
            _id: "some-id",
            title: "old-title",
            description: "some-description"
        } as any;

        const newPost = {
            _id: "some-id",
            title: "new-title",
            description: "some-description"
        } as any;
        return database.collection("Posts").insert(oldPost)
            .then(() => {
                return agent.post("localhost:3030/post/update")
                    .send(newPost)
                    .catch(error => error.response)
                    .then(response => {
                        const projection = { title: true, description: true };
                        return database.collection("Posts").find({}, projection).toArray()
                            .then(posts => posts.should.deep.equal([newPost]));
                    });
            });
    });

});
