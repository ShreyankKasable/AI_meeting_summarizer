# Kubernetes Deployment

This folder deploys the backend API and embedding worker as separate Kubernetes
workloads using the same GHCR image.

## Image

Current image:

```txt
ghcr.io/shreyankkasable/ai_meeting_summarizer/backend:latest
```

The GitHub Actions image workflow publishes both `linux/amd64` and
`linux/arm64`. Keep `linux/arm64` enabled for Oracle Cloud Always Free A1
instances.

For production, prefer replacing `latest` in both deployment files with the
immutable `sha-...` tag from GitHub Actions.

## Oracle Cloud Notes

For the lowest-cost Kubernetes path, use Oracle Kubernetes Engine with the free
A1 ARM shape where available. After creating the cluster, download the kubeconfig
from OCI and confirm your local `kubectl` is pointing at Oracle before applying
these manifests:

```bash
kubectl config current-context
kubectl get nodes
```

If the GHCR package is private, create an image pull secret in the `meetai`
namespace or make the package public before deploying.

## 1. Create The Secret

Do not commit real secrets. Copy the example and fill it locally:

```bash
copy k8s\secret.example.yaml k8s\secret.local.yaml
```

Edit `k8s/secret.local.yaml`, then apply:

```bash
kubectl apply -f k8s/namespace.yaml
kubectl apply -f k8s/secret.local.yaml
```

If the GHCR package is private, either make it public or create an image pull
secret and add it to both Deployment specs.

## 2. Deploy API And Worker

```bash
kubectl apply -k k8s
```

Check status:

```bash
kubectl get pods -n meetai
kubectl get svc -n meetai
kubectl logs -n meetai deploy/meetai-backend-api
kubectl logs -n meetai deploy/meetai-embedding-worker
```

## 3. Local Smoke Test

Before adding public ingress, port-forward the API:

```bash
kubectl port-forward -n meetai svc/meetai-backend-api 5000:80
```

Open:

```txt
http://localhost:5000/health
```

## 4. Public URL

Use `ingress.example.yaml` as a template after you know the domain and ingress
controller. Once the backend has a public HTTPS URL, set this Vercel frontend
environment variable:

```env
VITE_API_BASE_URL=https://api.your-domain.com
```

Also update backend CORS in `k8s/configmap.yaml` if your frontend domain changes:

```env
FRONTEND_ORIGINS=https://ai-meeting-summarizer-ashy-omega.vercel.app
```
