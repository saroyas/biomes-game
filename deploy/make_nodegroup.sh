# How to set up your nodegroup if you are using AWS EKS.
eksctl create nodegroup \
  --cluster $cluster \
  --name $nodegroup \
  --node-type m6i.2xlarge \
  --nodes-min 50 \
  --nodes-max 100 \
  --nodes 50
