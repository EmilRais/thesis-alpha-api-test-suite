function alpha-api-ready {
    (docker logs alpha-api-generated | grep "Listening") > /dev/null 2>&1;
}

docker run --detach --name alpha-api-generated -p 3030:3000 --net=restnet emilrais/alpha-api-generated;

echo "Waiting for alpha-api-generated to start"
while ! alpha-api-ready;
do sleep 0.1;
done

node_modules/mocha/bin/mocha build;

docker rm -f alpha-api-generated;
