#!/bin/bash

# First command: Build the server
./b build server

# Check if the previous command succeeded
if [ $? -ne 0 ]; then
    echo "Failed to build the server"
    exit 1
fi

# Second command: Run bobSSJ2
./bobSSJ2

# Check if the previous command succeeded
if [ $? -ne 0 ]; then
    echo "Failed to run bobSSJ2"
    exit 1
fi

# Third command: Delete specific Kubernetes pods
kubectl get pods --no-headers=true | grep -v "anima\|gaia\|redis" | awk '{print $1}' | xargs kubectl delete pod

# Check if the Kubernetes delete command succeeded
if [ $? -ne 0 ]; then
    echo "Failed to delete pods"
    exit 1
fi

echo "Operations completed successfully."
