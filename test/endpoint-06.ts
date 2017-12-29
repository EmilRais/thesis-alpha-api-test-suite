import * as chai from "chai";
const should = chai.should();

import { Db, MongoClient } from "mongodb";
import * as agent from "superagent";

describe("Endpoint 6 - GET /post/get/board", () => {
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

    it("1. Findes ingen opslagstavle med det angivne id skal endpointet returnere statussen Bad Request og en fejlbesked.", () => {
        return agent.get("localhost:3030/post/get/board?id=some-board-id")
            .catch(error => error.response)
            .then(response => {
                response.status.should.equal(400);
                response.text.should.deep.equal("Opslagstavlen eksisterer ikke");
            });
    });

    it("2. Findes ingen opslag på den angivne opslagstavle skal endpointet returnere statussen OK og en tom liste.", () => {
        const board = { _id: "some-board-id" };
        return database.collection("Boards").insert(board)
            .then(() => agent.get("localhost:3030/post/get/board?id=some-board-id"))
            .catch(error => error.response)
            .then(response => {
                response.status.should.equal(200);
                response.body.should.deep.equal([]);
            });
    });

    it("3. Findes opslag på den angivne opslagstavle skal endpointet returnere statussen OK og opslagene i en liste.", () => {
        const user = { _id: "user-id" };
        const board1 = { _id: "some-board-id" };
        const board2 = { _id: "some-other-id" };
        const post1 = { _id: "id-1", board: { _id: "some-board-id", image: null as string, name: null as string }, owner: { _id: "user-id", email: null as string, credential: null as any }, title: "some valid title", description: "some valid description", kind: "LOST", image: "some-image", date: 0, location: null as any, creationDate: 1234 };
        const post2 = { _id: "id-2", board: { _id: "some-other-id", image: null as string, name: null as string }, owner: { _id: "user-id", email: null as string, credential: null as any }, title: "some valid title", description: "some valid description", kind: "LOST", image: "some-image", date: 0, location: null as any, creationDate: 1234 };
        const post3 = { _id: "id-3", board: { _id: "some-board-id", image: null as string, name: null as string }, owner: { _id: "user-id", email: null as string, credential: null as any }, title: "some valid title", description: "some valid description", kind: "FOUND", image: "some-image", date: 0, location: null as any, creationDate: 1234 };

        return database.collection("Users").insert(user)
            .then(() => database.collection("Boards").insert([board1, board2]))
            .then(() => database.collection("Posts").insert([post1, post2, post3]))
            .then(() => agent.get("localhost:3030/post/get/board?id=some-board-id"))
            .catch(error => error.response)
            .then(response => {
                response.status.should.equal(200);
                response.body.should.deep.equal([post1, post3]);
            });
    });
});
