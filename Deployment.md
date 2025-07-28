Step 1: Create an EKS Cluster using eksctl

eksctl create cluster --name kube-demo1 --region us-east-1 --nodegroup-name standard-workers --node-type t3.medium \
  --nodes 1 \
  --nodes-min 1 \
  --nodes-max 2 \
  --managed \
  --with-oidc

This creates:
An EKS control plane


A managed node group


Automatically generates a kubeconfig for kubectl
--> Update the kube-config
aws eks update-kubeconfig --name kube-demo --region us-east-1


🔐 Step 2: Map your IAM role to admin using aws-auth

Get your role ARN:
aws sts get-caller-identity

Edit the aws-auth ConfigMap:
kubectl edit configmap aws-auth -n kube-system

Add this under mapRoles:
- rolearn: arn:aws:iam::<ACCOUNT_ID>:role/<YourEKSAdminRole>
  username: admin
  groups:
    - system:masters

eksctl utils associate-iam-oidc-provider \
  --cluster $CLUSTER_NAME \
  --region $REGION \
  --approve


🌐 Step 3: Set Up IAM OIDC Provider

eksctl utils associate-iam-oidc-provider \
  --region us-west-1 \
  --cluster my-eks-cluster \
  --approve


🛡️ Step 4: Install the AWS Load Balancer Controller
1. Create IAM policy

curl -o iam-policy.json https://raw.githubusercontent.com/kubernetes-sigs/aws-load-balancer-controller/main/docs/install/iam_policy.json

aws iam create-policy \
  --policy-name AWSLoadBalancerControllerIAMPolicy \
  --policy-document file://iam-policy.json

2. Create a service account

eksctl create iamserviceaccount \
  --cluster my-eks-cluster \
  --namespace kube-system \
  --name aws-load-balancer-controller \
  --attach-policy-arn arn:aws:iam::<ACCOUNT_ID>:policy/AWSLoadBalancerControllerIAMPolicy \
  --approve


3. Install the controller via Helm
helm repo add eks https://aws.github.io/eks-charts
helm repo update

helm install aws-load-balancer-controller eks/aws-load-balancer-controller \
  -n kube-system \
  --set clusterName=my-eks-cluster \
  --set serviceAccount.create=false \
  --set serviceAccount.name=aws-load-balancer-controller \
  --set region=us-west-2 \
  --set vpcId=<your-vpc-id> \
  --set image.tag="v2.6.2"



Argocd:
Install ArgoCD

1. Create ArgoCD namespace
kubectl create namespace argocd

2. Install ArgoCD using Helm or YAML
kubectl apply -n argocd -f https://raw.githubusercontent.com/argoproj/argo-cd/stable/manifests/install.yaml

3. Expose ArgoCD UI via Ingress or port-forward
kubectl port-forward svc/argocd-server -n argocd 8080:443

—------

IF everything working fine use(To add insecure in argocd server because we are using with http) :

kubectl patch deployment argocd-server -n argocd \
  --type='json' \
  -p='[
    {
      "op": "replace",
      "path": "/spec/template/spec/containers/0/args",
      "value": ["argocd-server", "--insecure"]
    }
  ]'

