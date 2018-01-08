function load-image {
   image=$1
   if [[ "$(docker images -q $image 2> /dev/null)" == "" ]]; then
       docker pull $image
   fi
}

function wait {
    container=$1
    message=$2

    function ready {
        docker logs $container | grep "$message" > /dev/null 2>&1
    }

    while ! ready;
    do sleep 0.1;
    done
}

load-image mongo
load-image emilrais/thesis-loom
load-image emilrais/thesis-alpha-api-manual
load-image emilrais/thesis-alpha-api-generated

npm run build
docker network create restnet > /dev/null 2>&1

echo "Starting external dependencies"
docker rm -f mongo > /dev/null 2>&1
docker run --detach --name mongo --net=restnet -p 27017:27017 mongo --setParameter enableTestCommands=1 > /dev/null 2>&1

echo "Waiting for external dependencies to start"
wait mongo "waiting for connections"
