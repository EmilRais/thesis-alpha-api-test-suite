docker run --detach --name alpha-api-manual -p 3030:8080 --net=restnet emilrais/alpha-api-manual;

echo "Waiting for alpha-api-manual to start"
sleep 15

node_modules/mocha/bin/mocha build;

docker rm -f alpha-api-manual;
