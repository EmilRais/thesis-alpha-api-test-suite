function mongo-ready {
    (docker logs mongo | grep "waiting for connections") > /dev/null 2>&1;
}

npm run build;
docker network create restnet;
docker run --detach --name mongo --net=restnet -p 27017:27017 mongo --setParameter enableTestCommands=1;

echo "Waiting for external dependencies to start"
while ! mongo-ready;
do sleep 0.1;
done
