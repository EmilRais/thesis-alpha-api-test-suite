function alpha-api-ready {
    (docker logs alpha-api-manual | grep "Deployed") > /dev/null 2>&1;
}

docker run --detach --name alpha-api-manual -p 3030:8080 --net=restnet emilrais/alpha-api-manual;

echo "Waiting for alpha-api-manual to start"
while ! alpha-api-ready;
do sleep 0.1;
done

node_modules/mocha/bin/mocha build;

docker rm -f alpha-api-manual;