import * as chai from "chai";
const should = chai.should();

import { Db, MongoClient } from "mongodb";
import * as agent from "superagent";

describe("Endpoint 2 - POST /board/create", () => {
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

    it("should return bad request when the input is invalid", () => {
        const board = { name: "some-name", image: "" };
        return agent.post("localhost:3030/board/create")
            .send(board)
            .catch(error => error.response)
            .then(response => {
                response.status.should.equal(400);
            });
    });

    it("should return internal server error when the database fails", () => {
        const board = { name: "some-name", image: "some-image" };
        return database.executeDbAdminCommand({ configureFailPoint: "throwSockExcep", mode: { times: 2 } })
            .catch(() => {})
            .then(() => {
                return agent.post("localhost:3030/board/create")
                    .send(board)
                    .catch(error => error.response)
                    .then(response => {
                        response.status.should.equal(500);
                    });
            });
    });

    it("should return created when succesful", () => {
        const board = { name: "some-name", image: "some-image" };
        return agent.post("localhost:3030/board/create")
            .send(board)
            .catch(error => error.response)
            .then(response => {
                response.status.should.equal(201);
            });
    });

    it("should store the board when succesful", () => {
        const board = { name: "some-name", image: "some-image" };
        return agent.post("localhost:3030/board/create")
            .send(board)
            .then(() => {
                return database.collection("Boards").find({}, { _id: false }).toArray()
                    .then(boards => {
                        boards.should.deep.equal([board]);
                    });
            });
    });

});
