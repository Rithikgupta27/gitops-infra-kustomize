# gitops-infra-kustomize

This repository contains a GitOps-based Kubernetes infrastructure setup using **Kustomize** for environment management and **KSOPS (SOPS + Kustomize)** for secure secret handling.

### 🔧 Features:
- Modular microservice deployments
- Environment overlays for dev, staging, and prod
- Encrypted secrets using SOPS (Age/GPG)
- Ready for GitOps tools like Flux or ArgoCD
- Extendable with HPA, Ingress, and observability setup


# Using Ksops
## What You'll Achieve
- Store DB secrets in a Kubernetes Secret (encrypted)
- Encrypt the secret with AWS KMS

'sops --encrypt --kms arn:aws:kms:us-east-1:123456789:key/aad754e-3601-4ab1-b9c7-jasdjasghdhsahd secrets.yaml > secrets.enc.yaml'

- Decrypt it on the fly using KSOPS + Kustomize


# Using PersistVolume 
## What You'll do
- you first install efs-csi driver if iam using efs
- Create PersistentVolume configuration
- Create PersistenceVolumeClaim and Attach to mysql stateful-set 

# We Required service to communicate with deployments

Ingress → Service → Deployment → Pods

