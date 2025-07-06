# gitops-infra-kustomize

This repository contains a GitOps-based Kubernetes infrastructure setup using **Kustomize** for environment management and **KSOPS (SOPS + Kustomize)** for secure secret handling.

### 🔧 Features:
- Modular microservice deployments
- Environment overlays for dev, staging, and prod
- Encrypted secrets using SOPS (Age/GPG)
- Ready for GitOps tools like Flux or ArgoCD
- Extendable with HPA, Ingress, and observability setup
