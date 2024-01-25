# How to set up your nodegroup if you are using AWS EKS.
eksctl create nodegroup \
  --cluster biomes-cluster \
  --name biomes-nodegroup \
  --node-type m6i.2xlarge \
  --nodes-min 5 \
  --nodes-max 100 \
  --nodes 5
