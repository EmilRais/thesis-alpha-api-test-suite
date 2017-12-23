import * as chai from "chai";
const should = chai.should();

import { Db, MongoClient } from "mongodb";
import * as agent from "superagent";

describe("Endpoint 1 - GET /board/get", () => {
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

    it("1. Findes der ingen opslagstavler skal endpointet returnere en tom liste og statussen OK.", () => {
        return agent.get("localhost:3030/board/get")
            .catch(error => error.response)
            .then(response => {
                response.status.should.equal(200);
                response.body.should.deep.equal([]);
            });
    });

    it("2. Findes der opslagstavler skal endpointet returnere dem i en liste og statussen OK.", () => {
        const boards = [
            { _id: "id-1" },
            { _id: "id-2" },
            { _id: "id-3" }
        ];

        return database.collection("Boards").insert(boards)
            .then(() => {
                return agent.get("localhost:3030/board/get")
                    .catch(error => error.response)
                    .then(response => {
                        response.status.should.equal(200);

                        const returnedBoards = response.body.map((board: any) => ({ _id: board._id }));
                        returnedBoards.should.deep.equal(boards);
                    });
            });
    });
});
