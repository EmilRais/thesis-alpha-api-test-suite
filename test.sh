function wait {
    container=$1
    message=$2

    function ready {
        docker logs $container | grep "$message" > /dev/null 2>&1
    }

    echo "Waiting for $container to start"
    while ! ready;
    do sleep 0.1;
    done
}

function test-alpha-api-manual {
    echo "Testing alpha-api-manual"
    docker run --detach --name alpha-api-manual -p 3030:8080 --net=restnet emilrais/alpha-api-manual > /dev/null 2>&1
    wait alpha-api-manual "Deployed"

    node_modules/mocha/bin/mocha build

    docker rm -f alpha-api-manual > /dev/null 2>&1
}

function test-alpha-api-generated {
    echo "Testing alpha-api-generated"
    docker run --detach --name alpha-api-generated -p 3030:3000 --net=restnet emilrais/alpha-api-generated > /dev/null 2>&1
    wait alpha-api-generated "Listening"

    node_modules/mocha/bin/mocha build

    docker rm -f alpha-api-generated > /dev/null 2>&1
}

test-alpha-api-manual
test-alpha-api-generated
