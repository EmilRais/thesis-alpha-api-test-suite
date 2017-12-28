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

    it("1. Er opslagstavlen ugyldig skal endpointet returnere Bad Request.", () => {
        const board = { name: "some-name", image: "" };
        return agent.post("localhost:3030/board/create")
            .send(board)
            .catch(error => error.response)
            .then(response => {
                response.status.should.equal(400);
            });
    });

    it("2. Er opslagstavlen gyldig skal endpointet returnere Created.", () => {
        const board = { name: "some-name", image: "some-image" };
        return agent.post("localhost:3030/board/create")
            .send(board)
            .catch(error => error.response)
            .then(response => {
                response.status.should.equal(201);
            });
    });

    it("3. Er opslagstavlen gyldig skal den efterfølgende findes i Boards.", () => {
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
