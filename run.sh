#!/bin/bash

container_name="patternfy-react-seed"
image=pentadoc/$container_name

podman run --network host -it --name $container_name --rm $image
