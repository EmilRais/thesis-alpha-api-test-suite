npm run build;
docker network create restnet;
docker run --detach --name mongo --net=restnet -p 27017:27017 mongo --setParameter enableTestCommands=1;

echo "Waiting for external dependencies to start"
sleep 5