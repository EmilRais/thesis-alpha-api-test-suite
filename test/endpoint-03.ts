import * as chai from "chai";
const should = chai.should();

import { Db, MongoClient } from "mongodb";
import * as agent from "superagent";

describe("Endpoint 3 - POST /post/create", () => {
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

    it("1. Findes opslagets ejer ikke skal endpointet returnere statussen Bad Request og en fejlbesked.", () => {
        const user = { _id: "some-user-id", email: null as string, credential: null as any };
        const board = { _id: "some-board-id", name: null as string, image: null as string };

        const location = { latitude: 42, longitude: 1337, name: "some-name", city: "some-city", postalCode: "some-postal-code" };
        const post = { title: "some-title", description: "some-long-description", kind: "LOST", date: 0, image: "some-image", location: location, owner: user, board: board };

        return database.collection("Boards").insert(board)
            .then(() => agent.post("localhost:3030/post/create").send(post))
            .catch(error => error.response)
            .then(response => {
                response.status.should.equal(400);
                response.text.should.equal("Brugeren eksisterer ikke");
            });
    });

    it("2. Findes opslagets opslagstavle ikke skal endpointet returnere statussen Bad Request og en fejlbesked.", () => {
        const user = { _id: "some-user-id", email: null as string, credential: null as any };
        const board = { _id: "some-board-id", name: null as string, image: null as string };

        const location = { latitude: 42, longitude: 1337, name: "some-name", city: "some-city", postalCode: "some-postal-code" };
        const post = { title: "some-title", description: "some-long-description", kind: "LOST", date: 0, image: "some-image", location: location, owner: user, board: board };

        return database.collection("Users").insert(user)
            .then(() => agent.post("localhost:3030/post/create").send(post))
            .catch(error => error.response)
            .then(response => {
                response.status.should.equal(400);
                response.text.should.equal("Opslagstavle eksisterer ikke");
            });
    });

    it("3. Er opslaget ugyldigt skal endpointet returnere statussen Bad Request.", () => {
        const user = { _id: "some-user-id", email: null as string, credential: null as any };
        const board = { _id: "some-board-id", name: null as string, image: null as string };

        const location = { latitude: 42, longitude: 1337, name: "some-name", city: "some-city", postalCode: "some-postal-code" };
        const post = { description: "some-long-description", kind: "LOST", date: 0, image: "some-image", location: location, owner: user, board: board };

        return database.collection("Users").insert(user)
            .then(() => database.collection("Boards").insert(board))
            .then(() => agent.post("localhost:3030/post/create").send(post))
            .catch(error => error.response)
            .then(response => {
                response.status.should.equal(400);
            });
    });

    it("4. Er opslaget gyldigt skal endpointet returnere statussen Created.", () => {
        const user = { _id: "some-user-id", email: null as string, credential: null as any };
        const board = { _id: "some-board-id", name: null as string, image: null as string };

        const location = { latitude: 42, longitude: 1337, name: "some-name", city: "some-city", postalCode: "some-postal-code" };
        const post = { title: "some-title", description: "some-long-description", kind: "LOST", date: 0, image: "some-image", location: location, owner: user, board: board };

        return database.collection("Users").insert(user)
            .then(() => database.collection("Boards").insert(board))
            .then(() => agent.post("localhost:3030/post/create").send(post))
            .catch(error => error.response)
            .then(response => {
                response.status.should.equal(201);
            });
    });

    it("5. Er opslaget gyldigt skal det efterfølgende forefindes i databasen.", () => {
        const user = { _id: "some-user-id", email: null as string, credential: null as any };
        const board = { _id: "some-board-id", name: null as string, image: null as string };

        const location = { latitude: 42, longitude: 1337, name: "some-name", city: "some-city", postalCode: "some-postal-code" };
        const post = { title: "some-title", description: "some-long-description", kind: "LOST", date: 0, image: "some-image", location: location, owner: user, board: board };

        return database.collection("Users").insert(user)
            .then(() => database.collection("Boards").insert(board))
            .then(() => agent.post("localhost:3030/post/create").send(post))
            .catch(error => error.response)
            .then(response => {
                const projection = { _id: false, creationDate: false };
                return database.collection("Posts").find({}, projection).toArray()
                    .then(posts => posts.should.deep.equal([post]));
            });
    });
});
