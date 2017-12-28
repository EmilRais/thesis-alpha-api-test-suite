echo "Stopping external dependencies"
docker rm -f mongo > /dev/null 2>&1
docker network rm restnet > /dev/null 2>&1
