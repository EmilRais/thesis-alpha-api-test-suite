docker run --detach --name alpha-api-generated -p 3030:3000 --net=restnet emilrais/alpha-api-generated;

echo "Waiting for alpha-api-generated to start"
sleep 5

node_modules/mocha/bin/mocha build;

docker rm -f alpha-api-generated;
